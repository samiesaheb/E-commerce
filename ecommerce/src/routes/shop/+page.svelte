<script lang="ts">
  import { cart } from "$lib/stores/cart";
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

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

  onMount(async () => {
    const token = localStorage.getItem("jwt_token");
    userLoggedIn = !!token;

    try {
      const response = await fetch("/api/products");
      console.log("API Fetch Response:", response); // ✅ Log response status
      if (!response.ok) {
        console.error("Failed to fetch products:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Raw API Response:", JSON.stringify(data, null, 2)); // ✅ Debugging log
      products = [...data]; // ✅ Ensure reactivity
      filteredProducts = [...products]; // ✅ Initialize filteredProducts
      console.log("Processed Products:", products); // ✅ Debugging log
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    // ✅ Get search query from URL
    const urlParams = new URLSearchParams($page.url.search);
    searchQuery = urlParams.get("search") || "";
    filterProducts();
  });

  function filterProducts() {
    filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function addToCart(product: Product) {
    if (!userLoggedIn) {
      alert("You must be logged in to add items to the cart.");
      return;
    }
    cart.update(items => {
      const existingItem = items.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }
      return [...items];
    });
  }

  function sortProducts() {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }
</script>

<h1>Shop</h1>

<input type="text" placeholder="Search products..." bind:value={searchQuery} on:input={filterProducts}>

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
  <ul>
    {#each filteredProducts as product}
      <li>
        <h2>
          <a href={"/shop/" + product.name.toLowerCase().replace(/\s+/g, "-")}>{product.name}</a>
        </h2>
        <p>{product.description}</p>
        <p>Price: ${product.price.toFixed(2)}</p>
        {#if userLoggedIn}
          <button on:click={() => addToCart(product)}>Add to Cart</button>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p>No products found.</p>
{/if}
