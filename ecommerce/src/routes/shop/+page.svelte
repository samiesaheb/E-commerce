<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { cart, addToCart, updateCartQuantity } from "$lib/stores/cart";

  type Product = {
    id: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    stock?: number;
  };

  let userLoggedIn = false;
  let searchQuery = "";
  let sortOption = "name-asc";
  let products: Product[] = [];
  let filteredProducts: Product[] = [];

  $: cartItems = $cart;

  onMount(async () => {
    const token = localStorage.getItem("jwt_token");
    userLoggedIn = !!token;

    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      products = [...data];
      filteredProducts = [...products];
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }

    const urlParams = new URLSearchParams($page.url.search);
    searchQuery = urlParams.get("search") || "";
    filterProducts();
  });

  function filterProducts() {
    filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    sortProducts(); // Re-apply sorting after filtering
  }

  function sortProducts() {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  }

  function handleAddToCart(product: Product) {
  if (!userLoggedIn) {
    alert("Please log in to add items to your cart.");
    return;
  }
  if (product.stock && product.stock <= 0) {
    alert("This item is currently out of stock.");
    return;
  }

  const existingItem = $cart.find(item => item.id === product.id);
  if (existingItem) {
    updateCartQuantity(product.id, existingItem.quantity + 1);
  } else {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock
    } as any); // Temporary type assertion - we'll fix this properly below
  }
}

  function incrementQuantity(product: Product) {
    const existingItem = $cart.find(item => item.id === product.id);
    if (existingItem && product.stock && existingItem.quantity >= product.stock) {
      alert("Cannot add more than available stock.");
      return;
    }
    if (existingItem) {
      updateCartQuantity(product.id, existingItem.quantity + 1);
    } else {
      handleAddToCart(product);
    }
  }

  function decrementQuantity(product: Product) {
    const existingItem = $cart.find(item => item.id === product.id);
    if (existingItem && existingItem.quantity > 1) {
      updateCartQuantity(product.id, existingItem.quantity - 1);
    } else if (existingItem && existingItem.quantity === 1) {
      updateCartQuantity(product.id, 0);
    }
  }
</script>

<div class="shop-container">
  <header class="shop-header">
    <h1>Our Store</h1>
    <div class="search-bar">
      <input
        type="text"
        placeholder="Search products..."
        bind:value={searchQuery}
        on:input={filterProducts}
      />
      <select bind:value={sortOption} on:change={sortProducts}>
        <option value="name-asc">Name: A-Z</option>
        <option value="name-desc">Name: Z-A</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  </header>

  {#if searchQuery}
    <p class="search-results">Showing results for "{searchQuery}"</p>
  {/if}

  {#if filteredProducts.length > 0}
    <div class="product-grid">
      {#each filteredProducts as product}
        <div class="product-card">
          <div class="product-image">
            {#if product.image}
              <img src={product.image} alt={product.name} />
            {:else}
              <div class="placeholder-image">No Image</div>
            {/if}
          </div>
          <div class="product-details">
            <h2>
              <a href={`/shop/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
                {product.name}
              </a>
            </h2>
            <p class="description">{product.description}</p>
            <div class="product-footer">
              <span class="price">${product.price.toFixed(2)}</span>
              {#if product.stock !== undefined}
                <span class="stock">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              {/if}
            </div>
            {#if userLoggedIn}
              <div class="cart-controls">
                {#if cartItems.some(item => item.id === product.id)}
                  <div class="quantity-controls">
                    <button class="quantity-btn" on:click={() => decrementQuantity(product)}>-</button>
                    <span class="quantity">
                      {cartItems.find(item => item.id === product.id)?.quantity || 0}
                    </span>
                    <button class="quantity-btn" on:click={() => incrementQuantity(product)}>+</button>
                  </div>
                {:else}
                  <button 
                    class="add-to-cart" 
                    on:click={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="no-products">No products found matching your search.</p>
  {/if}
</div>

<style>
  .shop-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .shop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .search-bar {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  input, select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input {
    width: 300px;
  }

  .search-results {
    margin-bottom: 1.5rem;
    color: #666;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }

  .product-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s;
  }

  .product-card:hover {
    transform: translateY(-5px);
  }

  .product-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }

  .product-details {
    padding: 1rem;
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }

  h2 a {
    text-decoration: none;
    color: #333;
  }

  h2 a:hover {
    color: #007bff;
  }

  .description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    height: 3rem;
    overflow: hidden;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .stock {
    font-size: 0.9rem;
    color: #666;
  }

  .cart-controls {
    display: flex;
    justify-content: flex-end;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-btn {
    width: 30px;
    height: 30px;
    padding: 0;
    background: #f0f0f0;
    color: #333;
  }

  .quantity {
    min-width: 20px;
    text-align: center;
  }

  .add-to-cart {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    border-radius: 4px;
    font-weight: bold;
  }

  .add-to-cart:hover {
    background: #218838;
  }

  .add-to-cart:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .no-products {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
</style>