<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { cart, addToCart, updateCartQuantity } from "$lib/stores/cart";
  import { goto } from "$app/navigation";

  type Product = {
    id: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    stock?: number;
    category?: string;
  };

  export let data: { products: { _id: string; name: string; description: string; image?: string; price: number; stock?: number; category?: string }[] };
  let userLoggedIn = false;
  let searchQuery = $page.url.searchParams.get("search") || "";
  let category = $page.url.searchParams.get("category") || "";
  let sortOption = $page.url.searchParams.get("sort") || "name-asc";
  let filteredProducts: Product[] = [];
  let allProducts: Product[] = []; // Store all fetched products for client-side filtering
  let errorMessage = "";
  let loading = true;
  let debounceTimer: NodeJS.Timeout;

  $: cartItems = $cart;
  $: {
    console.log("Raw API Data:", data.products);
    if (data.products && Array.isArray(data.products)) {
      allProducts = data.products.map(p => ({
        id: p._id,
        name: p.name,
        description: p.description,
        image: p.image,
        price: p.price,
        stock: p.stock,
        category: p.category
      }));
      filterProducts(); // Apply client-side filtering
      errorMessage = filteredProducts.length === 0 ? "No products found." : "";
    } else {
      allProducts = [];
      filteredProducts = [];
      errorMessage = "Failed to load products from server.";
    }
    console.log("Mapped Filtered Products:", filteredProducts);
    loading = false;
  }

  onMount(async () => {
    const token = localStorage.getItem("jwt_token");
    userLoggedIn = !!token;

    searchQuery = $page.url.searchParams.get("search") || "";
    category = $page.url.searchParams.get("category") || "";
    sortOption = $page.url.searchParams.get("sort") || "name-asc";
  });

  // Client-side filtering
  function filterProducts() {
    filteredProducts = allProducts.filter(product => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesCategory = category ? product.category === category : true;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    filteredProducts.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  // Debounced server fetch
  async function fetchProducts() {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (category) params.set("category", category);
    params.set("sort", sortOption);

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      data.products = products; // Update data to trigger reactive block
    } catch (error) {
      console.error("Error fetching products:", error);
      errorMessage = "Failed to fetch products.";
    }
  }

  // Debounce search input and fetch
  function handleSearchInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms delay for server fetch
    filterProducts(); // Immediate client-side filtering
  }

  // Handle Enter key to navigate
  function handleSearchSubmit(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (category) params.set("category", category);
      params.set("sort", sortOption);
      goto(`/shop?${params.toString()}`, { replaceState: true });
    }
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
      });
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

<div class="shop-page">
  <div class="header">
    <h1>Shop</h1>
    <p>Browse our curated collection</p>
  </div>

  <div class="filters">
    <div class="filter-group">
      <label for="search">Search</label>
      <input
        id="search"
        type="text"
        placeholder="Search products..."
        bind:value={searchQuery}
        on:input={handleSearchInput}
        on:keydown={handleSearchSubmit}
      />
    </div>
    <div class="filter-group">
      <label for="category">Category</label>
      <select id="category" bind:value={category} on:change={fetchProducts}>
        <option value="">All Categories</option>
        <option value="skin-care">Skin Care</option>
        <option value="body-care">Body Care</option>
        <option value="hair-care">Hair Care</option>
        <option value="baby-care">Baby Care</option>
        <option value="cosmetics">Cosmetics</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="sort">Sort By</label>
      <select id="sort" bind:value={sortOption} on:change={fetchProducts}>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
      </select>
    </div>
  </div>

  {#if loading}
    <p class="loading">Loading products...</p>
  {:else}
    {#if searchQuery || category}
      <p class="search-results">
        Showing results for 
        {searchQuery ? `"${searchQuery}"` : ""}
        {searchQuery && category ? " in " : ""}
        {category ? category.replace("-", " ") : ""}
      </p>
    {/if}

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {:else if filteredProducts.length > 0}
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
      <p class="no-products">No products found.</p>
    {/if}
  {/if}
</div>

<style>
  /* Unchanged styles from previous version */
  .shop-page {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
  }

  .header p {
    font-size: 1.1rem;
    color: #666;
  }

  .filters {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: #333;
  }

  input, select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    color: #333;
    width: 200px;
  }

  .search-results {
    margin-bottom: 1.5rem;
    color: #666;
    text-align: center;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  .product-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: transform 0.3s;
  }

  .product-card:hover {
    transform: translateY(-5px);
  }

  .product-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    border-radius: 8px;
  }

  .product-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  h2 a {
    text-decoration: none;
    color: #333;
  }

  h2 a:hover {
    color: #EF0107;
  }

  .description {
    color: #666;
    font-size: 0.9rem;
    height: 3rem;
    overflow: hidden;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #EF0107;
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
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.2rem;
  }

  .quantity-btn {
    width: 30px;
    height: 30px;
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .quantity-btn:hover {
    background: #ddd;
  }

  .quantity {
    min-width: 30px;
    text-align: center;
    font-weight: 500;
  }

  .add-to-cart {
    padding: 0.75rem 1.5rem;
    background: #EF0107;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
  }

  .add-to-cart:hover {
    background: #ff8787;
  }

  .add-to-cart:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .loading, .no-products, .error {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.2rem;
  }

  .error {
    color: #ff4444;
  }

  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
      align-items: center;
    }

    input, select {
      width: 100%;
      max-width: 300px;
    }
  }
</style>