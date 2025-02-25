import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) return; // ✅ Avoid duplicate connections

    if (!MONGO_URI) {
        console.error("❌ Missing MONGO_URI environment variable.");
        throw new Error("Missing MONGO_URI environment variable.");
    }

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: "ecommerce", // ✅ Ensure the correct database name
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as mongoose.ConnectOptions);
        console.log("✅ MongoDB connected.");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
    }
}


// ✅ User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "/default-avatar.png" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

// ✅ Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, default: "/default-product.png" },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 10 },
    category: { type: String },
}, { timestamps: true });

// ✅ Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

// ✅ Cart Schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String }
        }
    ],
}, { timestamps: true });

// ✅ Prevent "Cannot overwrite model" errors
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
export const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
