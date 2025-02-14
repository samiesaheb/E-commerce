import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

let connection: typeof mongoose | null = null;

export async function connectToDatabase() {
    if (connection) return;
    if (!MONGO_URI) {
        throw new Error("Missing MONGO_URI environment variable.");
    }

    connection = await mongoose.connect(MONGO_URI);
}

// ✅ User Schema (Updated to Include Email Verification & Password Reset)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "/default-avatar.png" }, // ✅ Profile Picture
    isVerified: { type: Boolean, default: false }, // ✅ Email Verification Status
    verificationToken: { type: String, default: null }, // ✅ Token for email verification
    resetPasswordToken: { type: String, default: null }, // ✅ Token for password reset
    resetPasswordExpires: { type: Date, default: null } // ✅ Expiry time for password reset
});

// ✅ Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent "Cannot overwrite model" errors
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
