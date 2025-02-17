import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { connectToDatabase, OrderModel } from "$lib/db";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const GET: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded: JwtPayload;
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            if (typeof payload === "string") {
                return new Response(JSON.stringify({ error: "Invalid token format." }), { status: 401 });
            }
            decoded = payload as JwtPayload;
        } catch (error: unknown) {
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
        }

        if (!decoded || !decoded.id) {
            return new Response(JSON.stringify({ error: "Invalid token payload." }), { status: 401 });
        }

        const userId = decoded.id;
        const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });

        return new Response(JSON.stringify(orders), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: unknown) {
        console.error("Orders API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded: JwtPayload;
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            if (typeof payload === "string") {
                return new Response(JSON.stringify({ error: "Invalid token format." }), { status: 401 });
            }
            decoded = payload as JwtPayload;
        } catch (error: unknown) {
            return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
        }

        if (!decoded || !decoded.id) {
            return new Response(JSON.stringify({ error: "Invalid token payload." }), { status: 401 });
        }

        const { orderId } = await request.json();
        if (!orderId) {
            return new Response(JSON.stringify({ error: "Missing order ID." }), { status: 400 });
        }

        const result = await OrderModel.deleteOne({ _id: orderId, userId: decoded.id });
        if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ error: "Order not found or not authorized." }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: unknown) {
        console.error("Orders API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
