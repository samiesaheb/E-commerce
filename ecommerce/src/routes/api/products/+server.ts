import type { RequestHandler } from '@sveltejs/kit';
import { connectToDatabase, ProductModel } from '$lib/db';

/**
 * GET: Fetch Products from MongoDB with Filtering and Sorting
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    console.log("✅ Database connected successfully"); // Debug connection

    const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
    const category = url.searchParams.get("category")?.toLowerCase() || "";
    const sort = url.searchParams.get("sort") || "name-asc";

    const query: any = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const sortOptions: { [key: string]: 1 | -1 } = {};
    switch (sort) {
      case "name-asc":
        sortOptions.name = 1;
        break;
      case "name-desc":
        sortOptions.name = -1;
        break;
      case "price-asc":
        sortOptions.price = 1;
        break;
      case "price-desc":
        sortOptions.price = -1;
        break;
      default:
        sortOptions.name = 1;
    }

    const products = await ProductModel.find(query, { __v: 0 }).sort(sortOptions);
    console.log("Products from DB:", products); // Debug raw DB results

    if (!products || products.length === 0) {
      console.warn("⚠️ No products found in database. Inserting default products...");

      const defaultProducts = [
        { 
          _id: "1", 
          name: "Product A", 
          description: "Lorem ipsum dolor sit amet.", 
          image: "/images/product-a.jpg", 
          price: 10.00, 
          category: "skin-care",
          stock: 10
        },
        { 
          _id: "2", 
          name: "Product B", 
          description: "Dolor sit amet consectetur adipiscing.", 
          image: "/images/product-b.jpg", 
          price: 15.00, 
          category: "hair-care",
          stock: 10
        },
        { 
          _id: "3", 
          name: "Awesome Product", 
          description: "Consectetur adipiscing elit.", 
          image: "/images/awesome-product.jpg", 
          price: 20.00, 
          category: "body-care",
          stock: 10
        }
      ];

      try {
        await ProductModel.insertMany(defaultProducts, { ordered: false });
        console.log("✅ Default products inserted:", defaultProducts);
        return new Response(JSON.stringify(defaultProducts), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (insertError) {
        console.error("❌ Failed to insert default products:", insertError);
        throw new Error("Failed to insert default products");
      }
    }

    console.log("✅ Products retrieved:", products);
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching products:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to retrieve products", details: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

/**
 * POST: Add a New Product (For Admins)
 */
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

    return new Response(JSON.stringify(savedProduct), { 
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error adding product:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to add product", details: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};