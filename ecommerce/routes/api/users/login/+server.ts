import type { RequestHandler } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { connectToDatabase, UserModel } from "$lib/db";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        await connectToDatabase();

        const { email, password } = await request.json();
        const user = await UserModel.findOne({ email });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

        // ✅ Store JWT in HTTP-only cookie
        cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 2 * 60 * 60, // 2 hours
            sameSite: "strict"
        });

        return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });

    } catch (error) {
        console.error("Login Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
