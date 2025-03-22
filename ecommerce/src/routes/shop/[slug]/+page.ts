import type { PageLoad } from './$types';

type Product = {
  _id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  stock?: number;
  category?: string;
  reviews?: { userId: string; rating: number; comment: string; date: string }[];
};

type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export const load: PageLoad = async ({ params, fetch }) => {
  const slug = params.slug; // e.g., "baby-soft-wash"
  console.log("Loading product for slug:", slug);

  try {
    const response = await fetch(`/api/products`);
    if (!response.ok) {
      console.error("Failed to fetch products:", response.status, await response.text());
      return { product: undefined, relatedProducts: [] };
    }
    const allProducts: Product[] = await response.json();
    console.log("All products fetched:", allProducts);

    // Find the product by matching slugified name
    const product = allProducts.find(p => {
      const slugifiedName = p.name.toLowerCase().replace(/\s+/g, "-");
      console.log("Comparing:", slugifiedName, "with", slug);
      return slugifiedName === slug;
    });

    if (!product) {
      console.log("Product not found for slug:", slug);
      return { product: undefined, relatedProducts: [] };
    }

    console.log("Found product:", product);

    // Fetch related products
    const relatedProducts: RelatedProduct[] = allProducts
      .filter(p => p._id !== product._id && p.category === product.category)
      .slice(0, 4)
      .map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image || "/default-product.png"
      }));

    return {
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        image: product.image || "/default-product.png",
        price: product.price,
        stock: product.stock,
        category: product.category,
        reviews: product.reviews
      },
      relatedProducts
    };
  } catch (error) {
    console.error("Error loading product:", error);
    return { product: undefined, relatedProducts: [] };
  }
};