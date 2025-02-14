import type { PageLoad } from "./$types";

type Product = {
  name: string;
  description: string;
  image?: string;
  price?: string;
};

export const load: PageLoad = async ({ url, fetch }) => {
  const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";

  // Fetch products from API
  const response = await fetch("/api/products");
  const products: Product[] = await response.json();

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery)
      )
    : products;

  return { products: filteredProducts, searchQuery };
};
