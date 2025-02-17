import { json } from "@sveltejs/kit";
import { connectToDatabase, OrderModel, CartModel } from "$lib/db";
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

        const { address, paymentMethod } = await request.json();
        if (!address || !paymentMethod) {
            return json({ error: "Missing address or payment method." }, { status: 400 });
        }

        const cart = await CartModel.findOne({ userId: decoded.id });
        if (!cart || !cart.items.length) {
            return json({ error: "Cart is empty." }, { status: 400 });
        }

        const totalAmount = cart.items.reduce((acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity, 0);

        const order = await OrderModel.create({
            userId: decoded.id,
            products: cart.items.map((item: { id: string; quantity: number }) => ({
                productId: item.id,
                quantity: item.quantity
            })),
            totalAmount,
            status: "pending"
        });

        await CartModel.deleteOne({ userId: decoded.id });

        return json({ success: true, orderId: order._id }, { status: 201 });
    } catch (error) {
        console.error("Checkout API Error:", error);
        return json({ error: "Internal Server Error" }, { status: 500 });
    }
}
