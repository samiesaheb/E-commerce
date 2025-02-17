<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  type Order = {
    _id: string;
    userId: string;
    products: { productId: string; name: string; quantity: number; price: number }[];
    totalAmount: number;
    status: string;
    createdAt: string;
  };

  let order: Order | null = null;
  let error = "";

  onMount(async () => {
    const orderId = $page.params.id;
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to load order details.");
      }
      
      order = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : "An unexpected error occurred.";
    }
  });
</script>

<h1>Order Details</h1>

{#if error}
  <p class="error">{error}</p>
{:else if order}
  <p><strong>Order ID:</strong> {order._id}</p>
  <p><strong>Status:</strong> {order.status}</p>
  <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
  <p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleString()}</p>

  <h3>Ordered Items</h3>
  <ul>
    {#each order.products as product}
      <li>
        {product.name} - {product.quantity} x ${product.price.toFixed(2)}
      </li>
    {/each}
  </ul>
{:else}
  <p>Loading...</p>
{/if}

<style>
  .error {
    color: red;
  }
</style>
