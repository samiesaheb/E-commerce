<script lang="ts">
  import { cart, addToCart, updateCartQuantity } from "$lib/stores/cart";

  export let data: { 
    product?: { 
      id: string;
      name: string; 
      description: string; 
      image: string; 
      price: number;
    } 
  };

  // Auto-subscribe to the cart store
  $: cartItems = $cart;

  function handleAddToCart() {
    if (!data.product) return;

    const existingItem = cartItems.find(item => item.id === data.product!.id);
    if (existingItem) {
      updateCartQuantity(data.product!.id, existingItem.quantity + 1);
    } else {
      addToCart({
        id: data.product!.id,
        name: data.product!.name,
        price: data.product!.price,
        image: data.product!.image
      });
    }
  }

  function incrementQuantity() {
    if (!data.product) return;
    handleAddToCart();
  }

  function decrementQuantity() {
    if (!data.product) return;

    const existingItem = cartItems.find(item => item.id === data.product!.id);
    if (existingItem && existingItem.quantity > 1) {
      updateCartQuantity(data.product!.id, existingItem.quantity - 1);
    } else if (existingItem && existingItem.quantity === 1) {
      updateCartQuantity(data.product!.id, 0); // Remove from cart
    }
  }
</script>

{#if data.product}
  <h1>{data.product.name}</h1>
  <img src={data.product.image} alt={data.product.name} style="max-width: 400px; height: auto;" />
  <p><strong>Description:</strong> {data.product.description}</p>
  <p><strong>Price:</strong> ${data.product.price.toFixed(2)}</p>

  <div class="cart-controls">
    {#if cartItems.some(item => item.id === data.product!.id)}
      <div class="quantity-controls">
        <button on:click={decrementQuantity}>-</button>
        <span>{cartItems.find(item => item.id === data.product!.id)?.quantity || 0}</span>
        <button on:click={incrementQuantity}>+</button>
      </div>
    {:else}
      <button on:click={handleAddToCart}>Add to Cart</button>
    {/if}
  </div>
{:else}
  <p>Product not found.</p>
{/if}

<style>
  .cart-controls {
    margin-top: 1rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
