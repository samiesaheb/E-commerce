<script lang="ts">
  import { cart, clearCart } from "$lib/stores/cart";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  let name = "";
  let address = "";
  let paymentMethod = "credit-card";
  let error = "";
  let success = false;

  const placeOrder = async () => {
    error = "";
    success = false;
    
    if (!name || !address) {
      error = "Please fill in all required fields.";
      return;
    }

    const orderData = {
      name,
      address,
      paymentMethod,
      items: get(cart),
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      error = "Failed to place order. Please try again.";
      return;
    }

    clearCart();
    success = true;
  };
</script>

<h1>Checkout</h1>

{#if success}
  <p>✅ Your order has been placed successfully!</p>
  <a href="/order/history">View Order History</a>
{:else}
  <form on:submit|preventDefault={placeOrder}>
    <label>Name:</label>
    <input type="text" bind:value={name} required />

    <label>Address:</label>
    <textarea bind:value={address} required></textarea>

    <label>Payment Method:</label>
    <select bind:value={paymentMethod}>
      <option value="credit-card">Credit Card</option>
      <option value="paypal">PayPal</option>
      <option value="cash">Cash on Delivery</option>
    </select>

    <h3>Order Summary</h3>
    <ul>
      {#each $cart as item}
        <li>{item.name} x {item.quantity} - ${item.price * item.quantity}</li>
      {/each}
    </ul>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button type="submit">Place Order</button>
  </form>
{/if}

<style>
  .error {
    color: red;
  }
</style>
