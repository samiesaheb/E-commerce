import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { connectToDatabase, UserModel } from "$lib/db";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const UPLOAD_DIR = "static/uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();
        console.log("✅ Database connected successfully");

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("No token provided in Authorization header");
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        console.log("Token received:", token);

        let decoded: JwtPayload;
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            if (typeof payload === "string") {
                console.error("Invalid token format - payload is string");
                return new Response(JSON.stringify({ error: "Invalid token format." }), { status: 401 });
            }
            decoded = payload as JwtPayload;
            console.log("Token decoded:", decoded);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown JWT error";
            console.error("JWT verification failed:", errorMessage);
            return new Response(JSON.stringify({ error: "Invalid or expired token", details: errorMessage }), { status: 401 });
        }

        const userId = decoded.id as string;
        if (!userId) {
            console.error("Missing user ID in token payload");
            return new Response(JSON.stringify({ error: "Invalid token payload (Missing user ID)." }), { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("profilePicture") as File;

        if (!file) {
            console.error("No file uploaded in form data");
            return new Response(JSON.stringify({ error: "No file uploaded." }), { status: 400 });
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            console.error("Invalid file type:", file.type);
            return new Response(JSON.stringify({ error: "Invalid file type. Only PNG or JPG allowed." }), { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const filePath = path.join(UPLOAD_DIR, `${userId}.png`);
        await writeFile(filePath, Buffer.from(buffer));
        console.log("File saved to:", filePath);

        const user = await UserModel.findById(userId);
        if (!user) {
            console.error("User not found for ID:", userId);
            return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
        }

        user.profilePicture = `/uploads/${userId}.png`;
        await user.save();
        console.log("User profile updated with picture:", user.profilePicture);

        return new Response(
            JSON.stringify({ profilePicture: user.profilePicture }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Profile Picture Upload Error:", errorMessage);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
            { status: 500 }
        );
    }
};