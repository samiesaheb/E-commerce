<script lang="ts">
  import { cart, clearCart } from "$lib/stores/cart";
  import { goto } from "$app/navigation";

  let paymentMethod = "credit_card"; // Default payment option
  let orderPlaced = false;
  let errorMessage = "";
  let orderId = ""; // Store orderId at component level
  let shippingInfo = {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  };

  // Compute total cost
  $: totalAmount = $cart.reduce((total, item) => total + item.price * item.quantity, 0);
  $: totalItems = $cart.reduce((sum, item) => sum + item.quantity, 0);
  $: shippingCost = 5.99; // Example flat shipping rate
  $: grandTotal = totalAmount + shippingCost;

  async function placeOrder() {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      errorMessage = "You must be logged in to place an order.";
      return;
    }

    if (!shippingInfo.firstName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country) {
      errorMessage = "Please fill out all shipping information.";
      return;
    }

    const orderData = {
      items: $cart,
      totalAmount: grandTotal,
      shippingCost,
      paymentMethod,
      shippingInfo
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order. Please try again.");
      }

      const result = await response.json();
      orderPlaced = true;
      orderId = result.orderId; // Store orderId for later use
      clearCart();
      setTimeout(() => goto(`/order/${result.orderId}`), 2000); // Delay for user feedback
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "An error occurred.";
    }
  }

  function continueShopping() {
    goto("/shop");
  }
</script>

<div class="checkout-page">
  <div class="checkout-container">
    {#if orderPlaced}
      <div class="success-message">
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase. You’ll be redirected to your order details shortly.</p>
        <button class="order-details-btn" on:click={() => goto(`/order/${orderId}`)}>View Order Now</button>
      </div>
    {:else}
      <div class="header">
        <h1>Checkout</h1>
        <p>Complete your purchase below</p>
      </div>

      {#if $cart.length > 0}
        <div class="checkout-content">
          <!-- Shipping Information -->
          <div class="shipping-section">
            <h2>Shipping Information</h2>
            <form class="shipping-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name</label>
                  <input 
                    id="firstName" 
                    type="text" 
                    bind:value={shippingInfo.firstName} 
                    required 
                    placeholder="John" 
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input 
                    id="lastName" 
                    type="text" 
                    bind:value={shippingInfo.lastName} 
                    required 
                    placeholder="Doe" 
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="address">Address</label>
                <input 
                  id="address" 
                  type="text" 
                  bind:value={shippingInfo.address} 
                  required 
                  placeholder="123 Main St" 
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="city">City</label>
                  <input 
                    id="city" 
                    type="text" 
                    bind:value={shippingInfo.city} 
                    required 
                    placeholder="New York" 
                  />
                </div>
                <div class="form-group">
                  <label for="postalCode">Postal Code</label>
                  <input 
                    id="postalCode" 
                    type="text" 
                    bind:value={shippingInfo.postalCode} 
                    required 
                    placeholder="10001" 
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="country">Country</label>
                <input 
                  id="country" 
                  type="text" 
                  bind:value={shippingInfo.country} 
                  required 
                  placeholder="United States" 
                />
              </div>
            </form>
          </div>

          <!-- Order Summary -->
          <div class="summary-section">
            <h2>Order Summary</h2>
            <div class="order-items">
              {#each $cart as item}
                <div class="order-item">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              {/each}
            </div>
            <div class="summary-details">
              <div class="summary-row">
                <span>Subtotal ({totalItems} items):</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="payment-method">
              <h3>Payment Method</h3>
              <select bind:value={paymentMethod}>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {#if errorMessage}
              <p class="error">{errorMessage}</p>
            {/if}

            <button class="place-order-btn" on:click={placeOrder}>Place Order</button>
            <button class="continue-btn" on:click={continueShopping}>Continue Shopping</button>
          </div>
        </div>
      {:else}
        <div class="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Please add items to your cart before checking out.</p>
          <button class="shop-now-btn" on:click={continueShopping}>Shop Now</button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .checkout-page {
    background: #f5f7fa;
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .checkout-container {
    max-width: 1200px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin: 0;
  }

  .header p {
    font-size: 1.1rem;
    color: #666;
    margin-top: 0.5rem;
  }

  .checkout-content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .shipping-section {
    flex: 2;
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 8px;
  }

  .shipping-section h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  .shipping-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }

  .form-group {
    flex: 1;
  }

  label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    color: #333;
    transition: border-color 0.3s;
  }

  input:focus {
    border-color: #ff6b6b;
    outline: none;
  }

  .summary-section {
    flex: 1;
    min-width: 300px;
    padding: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .summary-section h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .order-items {
    margin-bottom: 1.5rem;
  }

  .order-item {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.75rem;
  }

  .summary-details {
    margin-bottom: 1.5rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.75rem;
  }

  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }

  .payment-method {
    margin-bottom: 1.5rem;
  }

  .payment-method h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 0.75rem;
  }

  select {
    width: 100%;
    padding: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    color: #333;
  }

  .error {
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin: 1rem 0;
  }

  .place-order-btn, .continue-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .place-order-btn {
    background: #EF0107;
    color: white;
    margin-bottom: 1rem;
  }

  .place-order-btn:hover {
    background: #ff8787;
  }

  .continue-btn {
    background: #f5f5f5;
    color: #333;
  }

  .continue-btn:hover {
    background: #e0e0e0;
  }

  .success-message {
    text-align: center;
    padding: 4rem 0;
  }

  .success-message h1 {
    font-size: 2.5rem;
    color: #28a745;
    margin-bottom: 1rem;
  }

  .success-message p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .order-details-btn {
    padding: 1rem 2rem;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .order-details-btn:hover {
    background: #ff8787;
  }

  .empty-cart {
    text-align: center;
    padding: 4rem 0;
  }

  .empty-cart h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .empty-cart p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .shop-now-btn {
    padding: 1rem 2rem;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  .shop-now-btn:hover {
    background: #ff8787;
  }

  @media (max-width: 768px) {
    .checkout-content {
      flex-direction: column;
    }

    .form-row {
      flex-direction: column;
    }

    .summary-section {
      margin-top: 2rem;
    }
  }
</style>