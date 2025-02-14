import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { connectToDatabase, UserModel } from "$lib/db";
import { mkdir, writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const UPLOAD_DIR = "static/uploads";

// ✅ Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();

        // ✅ Extract token from Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        // ✅ Get token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // ✅ Verify JWT Token
        let decoded: JwtPayload;
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            if (typeof payload === "string") {
                return new Response(JSON.stringify({ error: "Invalid token format." }), { status: 401 });
            }
            decoded = payload as JwtPayload;
        } catch (error) {
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
        }

        // ✅ Ensure the decoded token contains an ID
        const userId = decoded.id as string;
        if (!userId) {
            return new Response(JSON.stringify({ error: "Invalid token payload (Missing user ID)." }), { status: 401 });
        }

        // ✅ Handle file upload
        const formData = await request.formData();
        const file = formData.get("profilePicture") as File;

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded." }), { status: 400 });
        }

        // ✅ Validate file type (ONLY Allow PNG & JPG)
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ error: "Invalid file type. Only PNG or JPG allowed." }), { status: 400 });
        }

        // ✅ Save file to local storage (Change if using cloud storage)
        const buffer = await file.arrayBuffer();
        const filePath = path.join(UPLOAD_DIR, `${userId}.png`);
        await writeFile(filePath, Buffer.from(buffer));

        // ✅ Update user profile in the database
        const user = await UserModel.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
        }

        user.profilePicture = `/uploads/${userId}.png`;
        await user.save();

        return new Response(
            JSON.stringify({ profilePicture: user.profilePicture }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Profile Picture Upload Error:", error);

        // ✅ Get precise error message
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
            { status: 500 }
        );
    }
};
