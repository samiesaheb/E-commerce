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
  };

  let userLoggedIn = false;
  let searchQuery = "";
  let sortOption = "name-asc";
  let products: Product[] = [];
  let filteredProducts: Product[] = [];

  // Auto-subscribe to the cart store
  $: cartItems = $cart;

  onMount(async () => {
    const token = localStorage.getItem("jwt_token");
    userLoggedIn = !!token;

    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        console.error("Failed to fetch products:", response.status);
        return;
      }
      const data = await response.json();
      products = [...data];
      filteredProducts = [...products];
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    const urlParams = new URLSearchParams($page.url.search);
    searchQuery = urlParams.get("search") || "";
    filterProducts();
  });

  function filterProducts() {
    filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function sortProducts() {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }

  function handleAddToCart(product: Product) {
    if (!userLoggedIn) {
      alert("You must be logged in to add items to the cart.");
      return;
    }

    const existingItem = $cart.find(item => item.id === product.id);
    if (existingItem) {
      updateCartQuantity(product.id, existingItem.quantity + 1); // Increment if already in cart
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
    }
  }

  function incrementQuantity(product: Product) {
    handleAddToCart(product);
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

<h1>Shop</h1>

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

{#if searchQuery}
  <p>Results for "{searchQuery}"</p>
{/if}

{#if filteredProducts.length > 0}
  <ul class="product-grid">
    {#each filteredProducts as product}
      <li class="product-card">
        <h2>
          <a href={"/shop/" + product.name.toLowerCase().replace(/\s+/g, "-")}>
            {product.name}
          </a>
        </h2>
        <p>{product.description}</p>
        <p>Price: ${product.price.toFixed(2)}</p>
        {#if userLoggedIn}
          <div class="cart-controls">
            {#if cartItems.some(item => item.id === product.id)}
              <div class="quantity-controls">
                <button on:click={() => decrementQuantity(product)}>-</button>
                <span>{cartItems.find(item => item.id === product.id)?.quantity || 0}</span>
                <button on:click={() => incrementQuantity(product)}>+</button>
              </div>
            {:else}
              <button on:click={() => handleAddToCart(product)}>Add to Cart</button>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p>No products found.</p>
{/if}

<style>
  .product-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 0;
  }

  .product-card {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 4px;
  }

  .cart-controls {
    margin-top: 1rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
