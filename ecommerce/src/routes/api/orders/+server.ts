import type { RequestHandler } from "@sveltejs/kit";
import { connectToDatabase, OrderModel, CartModel } from "$lib/db";
import { verifyToken } from "$lib/utils/auth";

// ✅ Define CartItem Type
type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

// ✅ GET: Retrieve user's orders (sorted by recent orders)
export const GET: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();
        const user = await verifyToken(request.headers.get("Authorization"));

        if (!user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized access." }), { status: 401 });
        }

        const orders = await OrderModel.find({ userId: user.id }).sort({ createdAt: -1 });

        return new Response(JSON.stringify(orders), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
    }
};

// ✅ POST: Place an order
export const POST: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();
        const user = await verifyToken(request.headers.get("Authorization"));

        if (!user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized access." }), { status: 401 });
        }

        const { items, totalAmount, paymentMethod } = await request.json();

        // ✅ Ensure items is a valid array
        if (!Array.isArray(items) || items.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid cart items." }), { status: 400 });
        }

        // ✅ Process products in order
        const products = items.map((item: CartItem) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || ""
        }));

        // ✅ Save the order to MongoDB
        const newOrder = new OrderModel({
            userId: user.id,
            products,
            totalAmount,
            paymentMethod,
            status: "pending",
            createdAt: new Date()
        });

        const savedOrder = await newOrder.save();

        // ✅ Clear user's cart **only after successful order placement**
        await CartModel.findOneAndDelete({ userId: user.id });

        return new Response(JSON.stringify({ success: true, orderId: savedOrder._id }), { status: 201 });
    } catch (error) {
        console.error("Order Submission Error:", error);
        return new Response(JSON.stringify({ error: "Failed to place order" }), { status: 500 });
    }
};

// ✅ DELETE: Remove an order by `orderId`
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();
        const user = await verifyToken(request.headers.get("Authorization"));

        if (!user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized access." }), { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return new Response(JSON.stringify({ error: "Missing order ID." }), { status: 400 });
        }

        const result = await OrderModel.deleteOne({ _id: orderId, userId: user.id });

        if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ error: "Order not found or unauthorized." }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error("Orders API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
