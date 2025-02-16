<script lang="ts">
  export let data;
  let searchQuery = data.searchQuery || "";
  let sortOption = "name-asc";

  type Product = {
    name: string;
    description: string;
    image?: string;
    price?: string | number;
  };

  let products: Product[] = data.products.map((product: any) => ({
    name: product.name,
    description: product.description,
    image: product.image,
    price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
  }));

  const sortProducts = () => {
    products = [...products].sort((a: Product, b: Product) => {
      const priceA = typeof a.price === "number" ? a.price : 0;
      const priceB = typeof b.price === "number" ? b.price : 0;
      
      if (sortOption === "price-asc") return priceA - priceB;
      if (sortOption === "price-desc") return priceB - priceA;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  };

  $: {
    products = data.products.map((product: any) => ({
      name: product.name,
      description: product.description,
      image: product.image,
      price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
    })).filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    sortProducts();
  };
</script>

<h1>Shop</h1>

<input type="text" placeholder="Search products..." bind:value={searchQuery}>

<select bind:value={sortOption} on:change={sortProducts}>
  <option value="name-asc">Name: A-Z</option>
  <option value="name-desc">Name: Z-A</option>
  <option value="price-asc">Price: Low to High</option>
  <option value="price-desc">Price: High to Low</option>
</select>

{#if searchQuery}
  <p>Results for "{searchQuery}"</p>
{/if}

{#if products.length > 0}
  <ul>
    {#each products as product}
      <li>
        <h2>
          <a href={"/shop/" + product.name.toLowerCase().replace(/\s+/g, "-")}>{product.name}</a>
        </h2>
        <p>{product.description}</p>
        <p>Price: ${typeof product.price === "number" ? product.price.toFixed(2) : "N/A"}</p>
      </li>
    {/each}
  </ul>
{:else}
  <p>No products found.</p>
{/if}
