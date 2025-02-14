import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { RequestEvent } from "@sveltejs/kit";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

/**
 * Verify and decode the JWT from the Authorization header
 */
export function verifyToken(event: RequestEvent) {
    const authHeader = event.request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { error: "No authentication token found.", status: 401 };
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { decoded, status: 200 };
    } catch (error) {
        return { error: "Invalid or expired token.", status: 403 };
    }
}
