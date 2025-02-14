<script lang="ts">
    import { onMount } from "svelte"; // Import `onMount`
    
    // Define a Product type
    type Product = {
      name: string;
      price: string;
    };

    let products: Product[] = [];  // Explicitly typed array

    async function fetchProducts() {
      const res = await fetch("/api/products");
      const data: Product[] = await res.json();  // Ensure fetched data is typed
      products = data;
    }

    onMount(fetchProducts);
</script>

<h1>Admin Dashboard</h1>

<ul>
  {#each products as product}
    <li>{product.name} - {product.price}</li>
  {/each}
</ul>
