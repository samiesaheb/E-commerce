<script lang="ts">
  import { cart, clearCart } from "$lib/stores/cart";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";

  let paymentMethod = "credit_card"; // Default payment option
  let orderPlaced = false;
  let errorMessage = "";

  // ✅ Compute total cost
  $: totalAmount = $cart.reduce((total, item) => total + item.price * item.quantity, 0);

  async function placeOrder() {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      errorMessage = "You must be logged in to place an order.";
      return;
    }

    const orderData = {
      items: get(cart),
      totalAmount,
      paymentMethod
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order. Please try again.");
      }

      const result = await response.json();
      orderPlaced = true;
      clearCart(); // ✅ Clear cart after successful checkout
      goto(`/order/${result.orderId}`); // ✅ Redirect to order confirmation page
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "An error occurred.";
    }
  }
</script>

<h1>Checkout</h1>

{#if orderPlaced}
  <p>Your order has been placed successfully! Redirecting...</p>
{:else}
  <div class="checkout-summary">
    <h2>Order Summary</h2>

    {#if $cart.length > 0}
      <ul>
        {#each $cart as item}
          <li>
            <span>{item.name} (x{item.quantity})</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        {/each}
      </ul>
      <p><strong>Total:</strong> ${totalAmount.toFixed(2)}</p>

      <label for="payment-method">Payment Method:</label>
      <select bind:value={paymentMethod}>
        <option value="credit_card">Credit Card</option>
        <option value="paypal">PayPal</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <button on:click={placeOrder} class="place-order-btn">Place Order</button>
    {:else}
      <p>Your cart is empty.</p>
    {/if}
  </div>
{/if}

<style>
  .checkout-summary {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    max-width: 500px;
    margin: 0 auto;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .place-order-btn {
    background-color: #007bff;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .place-order-btn:hover {
    background-color: #0056b3;
  }

  .error {
    color: red;
    margin-top: 0.5rem;
  }
</style>
