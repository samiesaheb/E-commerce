<script lang="ts">
  export let data: { product?: { name: string; description: string; image: string; price: string } };
</script>

{#if data.product}
<h1>{data.product.name}</h1>
<img src={data.product.image} alt={data.product.name} style="max-width: 400px; height: auto;" />
<p><strong>Description:</strong> {data.product.description}</p>
<p><strong>Price:</strong> {data.product.price}</p>
{:else}
<p>Product not found.</p>
{/if}
