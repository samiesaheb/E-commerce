import { json } from "@sveltejs/kit";
import { connectToDatabase, CartModel } from "$lib/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST({ request }) {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return json({ error: "No authentication token found." }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            if (typeof decoded === "string") {
                return json({ error: "Invalid token format." }, { status: 401 });
            }
        } catch (error) {
            return json({ error: "Invalid or expired token." }, { status: 401 });
        }

        const { items } = await request.json();
        if (!items || !Array.isArray(items)) {
            return json({ error: "Invalid cart data." }, { status: 400 });
        }

        await CartModel.updateOne(
            { userId: decoded.id },
            { $set: { items } },
            { upsert: true }
        );

        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Cart API Error:", error);
        return json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET({ request }) {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return json({ error: "No authentication token found." }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            if (typeof decoded === "string") {
                return json({ error: "Invalid token format." }, { status: 401 });
            }
        } catch (error) {
            return json({ error: "Invalid or expired token." }, { status: 401 });
        }

        const cart = await CartModel.findOne({ userId: decoded.id });
        return json(cart?.items || [], { status: 200 });
    } catch (error) {
        console.error("Cart API Error:", error);
        return json({ error: "Internal Server Error" }, { status: 500 });
    }
}
