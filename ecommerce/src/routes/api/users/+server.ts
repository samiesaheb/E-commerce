import type { RequestHandler } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { json } from "@sveltejs/kit";
import { connectToDatabase, UserModel } from "$lib/db";

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export const POST: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();

        const { email, password } = await request.json();
        console.log("📌 Login request received for:", email);

        // Find user in the database
        const user = await UserModel.findOne({ email });
        if (!user) {
            console.error("❌ User not found");
            return json({ error: "User not found" }, { status: 404 });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.error("❌ Invalid credentials");
            return json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email, id: user._id },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        console.log("✅ Login successful:", email);

        // Return token
        return json({ message: "Login successful", token }, { status: 200 });

    } catch (error) {
        console.error("❌ Login Error:", error);

        // ✅ Fix: Explicitly cast 'error' as an Error type
        return json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
};
