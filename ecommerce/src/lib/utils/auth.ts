import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "$lib/db";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ✅ Function to verify JWT token
export async function verifyToken(authHeader: string | null, requireAdmin = false) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("No authentication token found.");
    }

    const token = authHeader.split(" ")[1];

    let decoded: JwtPayload;
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (typeof payload === "string") throw new Error("Invalid token format.");
        decoded = payload as JwtPayload;
    } catch {
        throw new Error("Invalid or expired token.");
    }

    if (!decoded?.id) throw new Error("Invalid token payload.");

    // ✅ Fetch user from database
    const user = await UserModel.findById(decoded.id);
    if (!user) throw new Error("User not found.");

    // ✅ Ensure admin access if required
    if (requireAdmin && !user.isAdmin) {
        throw new Error("Admin access required.");
    }

    return user; // Return authenticated user
}
