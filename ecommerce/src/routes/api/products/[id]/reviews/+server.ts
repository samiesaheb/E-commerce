import type { RequestHandler } from '@sveltejs/kit';
import { connectToDatabase, ProductModel } from '$lib/db';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No authentication token found." }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
    }

    const userId = decoded.id;
    const { rating, comment } = await request.json();
    const productId = params.id; // Changed from params.slug to params.id to match route

    const product = await ProductModel.findById(productId);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found." }), { status: 404 });
    }

    const review = { userId, rating, comment, date: new Date().toISOString() };
    product.reviews = product.reviews || [];
    product.reviews.push(review);
    await product.save();

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error adding review:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to add review", details: errorMessage }), { status: 500 });
  }
};