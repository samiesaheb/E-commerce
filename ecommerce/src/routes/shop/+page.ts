import type { PageLoad } from './$types';

type Product = {
  _id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  stock?: number;
  category?: string;
};

export const load: PageLoad = async ({ url, fetch }) => {
  const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
  const category = url.searchParams.get("category")?.toLowerCase() || "";
  const sort = url.searchParams.get("sort") || "name-asc";
  const minPrice = url.searchParams.get("minPrice") || "";
  const maxPrice = url.searchParams.get("maxPrice") || "";
  const limit = url.searchParams.get("limit") || "";

  const params = new URLSearchParams();
  if (searchQuery) params.set("search", searchQuery);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (limit) params.set("limit", limit);

  console.log("Fetching products with URL:", `/api/products?${params.toString()}`);

  try {
    const response = await fetch(`/api/products?${params.toString()}`);
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch failed:", response.status, errorText);
      return { products: [] };
    }

    const products: Product[] = await response.json();
    console.log("Fetched products:", products);
    return { products };
  } catch (error) {
    console.error("Error in load function:", error);
    return { products: [] };
  }
};