import { json } from '@sveltejs/kit';
import { UserModel, connectToDatabase } from '$lib/db';
import bcrypt from 'bcryptjs';
import crypto from "crypto"; // ✅ Generate a random verification token
import { sendVerificationEmail } from "$lib/email";

export async function POST({ request }) {
    try {
        console.log("📌 Signup API called");

        await connectToDatabase();
        console.log("📌 Database connected");

        const { email, password } = await request.json();
        console.log("📌 Received data:", { email });

        if (!email || !password) {
            return json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return json({ error: "Email is already in use" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("📌 Password hashed");

        // ✅ Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Save user to database with verification token
        const newUser = new UserModel({ 
            email, 
            password: hashedPassword, 
            verificationToken 
        });
        await newUser.save();
        console.log("✅ User created successfully");

        // ✅ Send verification email
        const verificationLink = `http://localhost:5173/api/users/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(email, verificationLink);
        console.log("📩 Verification email sent");

        return json({ message: "User created successfully! Please check your email to verify your account." }, { status: 201 });

    } catch (error) {
        const err = error as Error; // ✅ Fix "error is of type 'unknown'"
        console.error("❌ Signup Error:", err);

        return json({
            error: "Internal Server Error",
            details: err.message // Log error message
        }, { status: 500 });
    }
}
