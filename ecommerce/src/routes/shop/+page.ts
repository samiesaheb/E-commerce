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

  const params = new URLSearchParams();
  if (searchQuery) params.set("search", searchQuery);
  if (category) params.set("category", category);
  params.set("sort", sort);

  console.log("Fetching products with URL:", `/api/products?${params.toString()}`); // Debug

  try {
    const response = await fetch(`/api/products?${params.toString()}`);
    console.log("Response status:", response.status); // Debug
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch failed:", response.status, errorText);
      return { products: [] };
    }

    const products: Product[] = await response.json();
    console.log("Fetched products:", products); // Debug
    return { products };
  } catch (error) {
    console.error("Error in load function:", error);
    return { products: [] };
  }
};