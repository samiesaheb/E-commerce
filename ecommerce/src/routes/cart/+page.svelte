<script lang="ts">
  import { cart, updateCartQuantity, clearCart } from "$lib/stores/cart";
  import { goto } from "$app/navigation";

  // Calculate totals dynamically using $cart directly
  $: totalAmount = $cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $: totalItems = $cart.reduce((sum, item) => sum + item.quantity, 0);

  function removeItem(id: string) {
    updateCartQuantity(id, 0); // Remove item from cart
  }

  function updateQuantity(id: string, amount: number) {
    const item = $cart.find(i => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + amount;

    if (newQuantity <= 0) {
      removeItem(id); // Remove the item when quantity reaches zero
    } else {
      updateCartQuantity(id, newQuantity);
    }
  }

  function proceedToCheckout() {
    goto("/checkout");
  }

  function continueShopping() {
    goto("/shop");
  }
</script>

<div class="cart-page">
  <div class="cart-container">
    <div class="header">
      <h1>Shopping Cart</h1>
      <p>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</p>
    </div>

    {#if $cart.length > 0}
      <div class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items">
          {#each $cart as item}
            <div class="cart-item">
              <div class="item-image">
                {#if item.image}
                  <img src={item.image} alt={item.name} />
                {:else}
                  <div class="placeholder-image">No Image</div>
                {/if}
              </div>
              <div class="item-details">
                <h2>{item.name}</h2>
                <p class="price">${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                  <button 
                    class="qty-btn" 
                    on:click={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >-</button>
                  <span class="quantity">{item.quantity}</span>
                  <button 
                    class="qty-btn" 
                    on:click={() => updateQuantity(item.id, 1)}
                    disabled={!!item.stock && item.quantity >= item.stock}
                  >+</button>
                </div>
              </div>
              <div class="item-actions">
                <p class="subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-btn" on:click={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          {/each}
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-details">
            <div class="summary-row">
              <span>Subtotal ({totalItems} items):</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>TBD at Checkout</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <button class="checkout-btn" on:click={proceedToCheckout}>Proceed to Checkout</button>
          <button class="continue-btn" on:click={continueShopping}>Continue Shopping</button>
        </div>
      </div>
    {:else}
      <div class="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet. Start shopping now!</p>
        <a href="/shop" class="shop-now-btn">Shop Now</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .cart-page {
    background: #f5f7fa;
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .cart-container {
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

  .cart-content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .cart-items {
    flex: 2;
    min-width: 0;
  }

  .cart-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    transition: background 0.3s;
  }

  .cart-item:hover {
    background: #f9f9f9;
  }

  .item-image img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .placeholder-image {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    color: #666;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .price {
    font-size: 1rem;
    color: #EF0107;
    font-weight: 600;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.2rem;
  }

  .qty-btn {
    width: 30px;
    height: 30px;
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .qty-btn:hover {
    background: #ddd;
  }

  .qty-btn:disabled {
    background: #e0e0e0;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .quantity {
    min-width: 30px;
    text-align: center;
    font-weight: 500;
    color: #333;
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .subtotal {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  .remove-btn {
    background: transparent;
    color: #EF0107;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.3s;
  }

  .remove-btn:hover {
    color: #cc3333;
  }

  .checkout-btn {
    background: #EF0107;
    color: white;
    padding: 1rem;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    width: 100%;
  }

  .checkout-btn:hover {
    background: #ff8787;
  }

  .empty-cart {
    text-align: center;
    padding: 4rem 0;
  }

  .shop-now-btn {
    display: inline-block;
    padding: 1rem 2rem;
    background: #ff6b6b;
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 6px;
    transition: background 0.3s;
  }
</style>
