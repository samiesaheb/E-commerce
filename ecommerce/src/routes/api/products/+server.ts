import type { RequestHandler } from '@sveltejs/kit';
import { connectToDatabase, ProductModel } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  console.log("GET /api/products requested with URL:", url.toString());

  const fallbackProducts = [
    { _id: "1", name: "Hydrating Face Cream", description: "A rich cream...", image: "/images/hydrating-face-cream.jpg", price: 24.99, category: "skin-care", stock: 15 },
    { _id: "2", name: "Volumizing Shampoo", description: "Boost hair volume...", image: "/images/volumizing-shampoo.jpg", price: 12.50, category: "hair-care", stock: 20 }
  ];

  try {
    console.log("Attempting to connect to database...");
    await connectToDatabase();
    console.log("✅ Database connected successfully");

    const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
    const category = url.searchParams.get("category")?.toLowerCase() || "";
    const sort = url.searchParams.get("sort") || "name-asc";
    const minPrice = url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice")!) : undefined;
    const maxPrice = url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice")!) : undefined;
    const exclude = url.searchParams.get("exclude") || "";
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined;

    const query: any = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    if (exclude) query._id = { $ne: exclude };

    const sortOptions: { [key: string]: 1 | -1 } = {};
    switch (sort) {
      case "name-asc": sortOptions.name = 1; break;
      case "name-desc": sortOptions.name = -1; break;
      case "price-asc": sortOptions.price = 1; break;
      case "price-desc": sortOptions.price = -1; break;
      default: sortOptions.name = 1;
    }

    console.log("Executing query:", JSON.stringify(query), "Sort:", sortOptions, "Limit:", limit);
    let queryBuilder = ProductModel.find(query, { __v: 0 }).sort(sortOptions);
    if (limit) queryBuilder = queryBuilder.limit(limit);

    let products = await queryBuilder.exec();
    console.log("✅ Products retrieved from DB:", products);

    if (!products || products.length === 0) {
      console.warn("⚠️ No products found in database. Inserting default products...");
      const defaultProducts = [
        { _id: "1", name: "Hydrating Face Cream", description: "A rich cream to keep your skin hydrated all day.", image: "/images/hydrating-face-cream.jpg", price: 24.99, category: "skin-care", stock: 15 },
        { _id: "2", name: "Volumizing Shampoo", description: "Boost hair volume with this sulfate-free shampoo.", image: "/images/volumizing-shampoo.jpg", price: 12.50, category: "hair-care", stock: 20 },
        { _id: "3", name: "Body Lotion Bliss", description: "Smooth and nourish your skin with natural ingredients.", image: "/images/body-lotion-bliss.jpg", price: 18.75, category: "body-care", stock: 10 },
        { _id: "4", name: "Baby Soft Wash", description: "Gentle wash for sensitive baby skin.", image: "/images/baby-soft-wash.jpg", price: 9.99, category: "baby-care", stock: 25 },
        { _id: "5", name: "Matte Lipstick", description: "Long-lasting matte finish in bold red.", image: "/images/matte-lipstick.jpg", price: 15.00, category: "cosmetics", stock: 30 },
        { _id: "6", name: "Exfoliating Scrub", description: "Remove dead skin cells with this gentle scrub.", image: "/images/exfoliating-scrub.jpg", price: 22.00, category: "skin-care", stock: 12 }
      ];
      try {
        await ProductModel.deleteMany({});
        console.log("Cleared existing products from database.");
        await ProductModel.insertMany(defaultProducts, { ordered: false });
        console.log("✅ Default products inserted:", defaultProducts);
        products = defaultProducts;
      } catch (insertError) {
        console.error("❌ Failed to insert default products:", insertError);
        products = defaultProducts;
        console.log("Using default products as fallback:", products);
      }
    }

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "No stack available";
    console.error("❌ Error in GET handler:", errorMessage, "Stack:", errorStack);
    console.log("Returning fallback products due to error:", fallbackProducts);
    return new Response(JSON.stringify(fallbackProducts), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    console.log("✅ Database connected successfully for POST");

    const { name, description, image, price, stock, category } = await request.json();

    if (!name || !description || !price) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const newProduct = new ProductModel({
      name,
      description,
      image: image || "/images/default-product.jpg",
      price,
      stock: stock ?? 10,
      category: category || "Uncategorized"
    });

    const savedProduct = await newProduct.save();
    console.log("✅ Product saved:", savedProduct);

    return new Response(JSON.stringify(savedProduct), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error adding product:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to add product", details: errorMessage }), { status: 500 });
  }
};