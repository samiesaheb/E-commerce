import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { connectToDatabase, CartModel } from "$lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ✅ GET: Retrieve user's cart
export const GET: RequestHandler = async ({ request }) => {
    await connectToDatabase();

    // ✅ Extract token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (!decoded?.id) throw new Error("Invalid token");

        // ✅ Fetch user's cart from MongoDB
        const cart = await CartModel.findOne({ userId: decoded.id });

        return json(cart ? cart.items : []);
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
    }
};

// ✅ POST: Update user's cart
export const POST: RequestHandler = async ({ request }) => {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { items } = await request.json();

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (!decoded?.id) throw new Error("Invalid token");

        // ✅ Find or create user's cart in MongoDB
        let cart = await CartModel.findOne({ userId: decoded.id });
        if (!cart) {
            cart = new CartModel({ userId: decoded.id, items });
        } else {
            cart.items = items; // ✅ Replace with updated items
        }
        await cart.save();

        return json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
    }
};

// ✅ DELETE: Clear user's cart (after checkout)
export const DELETE: RequestHandler = async ({ request }) => {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (!decoded?.id) throw new Error("Invalid token");

        // ✅ Remove cart from MongoDB
        await CartModel.findOneAndDelete({ userId: decoded.id });

        return json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
    }
};
