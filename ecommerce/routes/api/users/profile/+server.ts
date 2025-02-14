import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { connectToDatabase, UserModel } from "$lib/db";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        await connectToDatabase();

        // ✅ Extract JWT from cookies
        const token = cookies.get("authToken");
        if (!token) {
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        // ✅ Verify the JWT token
        let decoded: JwtPayload;
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            if (typeof payload === "string") {
                return new Response(JSON.stringify({ error: "Invalid token format." }), { status: 401 });
            }
            decoded = payload as JwtPayload;
        } catch {
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
        }

        if (!decoded.id) {
            return new Response(JSON.stringify({ error: "Invalid token payload." }), { status: 401 });
        }

        // ✅ Fetch user details from database
        const user = await UserModel.findById(decoded.id).select("-password"); // Don't return password
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Profile Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
