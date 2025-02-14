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

        // ✅ Extract token from Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
        }

        // ✅ Get token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // ✅ Verify the JWT token
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

        // ✅ Ensure the decoded token contains an ID
        if (!decoded || !decoded.id) {
            return new Response(JSON.stringify({ error: "Invalid token payload." }), { status: 401 });
        }

        // ✅ Fetch orders for the authenticated user
        const userId = decoded.id;
        const orders = await OrderModel.find({ userId });

        return new Response(JSON.stringify(orders), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: unknown) {
        console.error("Orders API Error:", error);

        // ✅ Typecast error for safe handling
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: errorMessage }),
            { status: 500 }
        );
    }
};
