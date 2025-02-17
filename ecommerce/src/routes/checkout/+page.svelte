<script lang="ts">
  import { cart, clearCart } from "$lib/stores/cart";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  let name = "";
  let address = "";
  let paymentMethod = "credit-card";
  let error = "";
  let success = false;
  let loading = false;

  // Calculate total price dynamically
  $: totalAmount = get(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    error = "";
    success = false;
    loading = true;

    if (!name || !address) {
      error = "Please fill in all required fields.";
      loading = false;
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
      loading = false;
      return;
    }

    clearCart();
    success = true;
    loading = false;
  };
</script>

<h1>Checkout</h1>

{#if success}
  <div class="success-message">
    ✅ Your order has been placed successfully!
    <a href="/order/history">View Order History</a>
  </div>
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
    <p><strong>Total:</strong> ${totalAmount.toFixed(2)}</p>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? "Placing Order..." : "Place Order"}
    </button>
  </form>
{/if}

<style>
  .error { color: red; }
  .success-message { background: #d4edda; padding: 10px; border-radius: 5px; }
  button[disabled] { background: gray; cursor: not-allowed; }
</style>
