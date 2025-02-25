import type { RequestHandler } from '@sveltejs/kit';
import { connectToDatabase, ProductModel } from '$lib/db';

/**
 * ✅ GET: Fetch Products from MongoDB or Seed Defaults
 */
export const GET: RequestHandler = async () => {
    try {
        await connectToDatabase();
        const products = await ProductModel.find({}, { __v: 0 });

        if (!products || products.length === 0) {
            console.warn("⚠️ No products found in database. Inserting default products...");

            // ✅ Insert Default Products
            const defaultProducts = [
                { name: "Product A", description: "Lorem ipsum dolor sit amet.", image: "/images/product-a.jpg", price: 10.00 },
                { name: "Product B", description: "Dolor sit amet consectetur adipiscing.", image: "/images/product-b.jpg", price: 15.00 },
                { name: "Awesome Product", description: "Consectetur adipiscing elit.", image: "/images/awesome-product.jpg", price: 20.00 }
            ];

            await ProductModel.insertMany(defaultProducts);
            console.log("✅ Default products inserted.");

            return new Response(JSON.stringify(defaultProducts), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log("✅ Products retrieved:", products);
        return new Response(JSON.stringify(products), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("❌ Error fetching products:", error);
        return new Response(JSON.stringify({ error: "Failed to retrieve products" }), { status: 500 });
    }
};



/**
 * ✅ POST: Add a New Product (For Admins)
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        await connectToDatabase();

        const { name, description, image, price, stock, category } = await request.json();

        if (!name || !description || !price) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const newProduct = new ProductModel({
            name,
            description,
            image: image || "/images/default-product.jpg",
            price,
            stock: stock ?? 10, // Default stock = 10
            category: category || "Uncategorized"
        });

        const savedProduct = await newProduct.save();

        return new Response(JSON.stringify(savedProduct), { status: 201 });

    } catch (error) {
        console.error("❌ Error adding product:", error);
        return new Response(JSON.stringify({ error: "Failed to add product" }), { status: 500 });
    }
};

// ✅ Default products (used if MongoDB is empty)
const defaultProducts = [
    { 
        _id: '1', 
        name: 'Product A', 
        description: 'Lorem ipsum dolor sit amet.', 
        image: '/images/product-a.jpg', 
        price: 10.00
    },
    { 
        _id: '2', 
        name: 'Product B', 
        description: 'Dolor sit amet consectetur adipiscing.', 
        image: '/images/product-b.jpg', 
        price: 15.00
    },
    { 
        _id: '3', 
        name: 'Awesome Product', 
        description: 'Consectetur adipiscing elit.', 
        image: '/images/awesome-product.jpg', 
        price: 20.00
    }
];
