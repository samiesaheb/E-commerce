<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
  
    type Order = {
      id: string;
      name: string;
      address: string;
      paymentMethod: string;
      status: string;
      items: { name: string; quantity: number; price: number }[];
    };
  
    let order: Order | null = null;
    let error = "";
  
    onMount(async () => {
      const orderId = $page.params.id;
      try {
        const response = await fetch(`/api/orders/${orderId}`);
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
    <p><strong>Name:</strong> {order.name}</p>
    <p><strong>Address:</strong> {order.address}</p>
    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
    <p><strong>Status:</strong> {order.status}</p>
  
    <h3>Items</h3>
    <ul>
      {#each order.items as item}
        <li>{item.name} x {item.quantity} - ${item.price.toFixed(2)}</li>
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
  