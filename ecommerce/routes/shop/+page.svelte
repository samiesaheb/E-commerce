<script lang="ts">
  export let data;
</script>

<h1>Shop</h1>

{#if data.searchQuery}
  <p>Results for "{data.searchQuery}"</p>
{/if}

{#if data.products.length > 0}
  <ul>
    {#each data.products as product}
      <li>
        <h2>
          <a href={"/shop/" + product.name.toLowerCase().replace(/\s+/g, "-")}>
            {product.name}
          </a>
        </h2>
        <p>{product.description}</p>
      </li>
    {/each}
  </ul>
{:else}
  <p>No products found.</p>
{/if}
