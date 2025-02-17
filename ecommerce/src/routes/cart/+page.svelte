<script lang="ts">
  import { cart } from "$lib/stores/cart";
  import { get } from "svelte/store";

  // Calculate total price dynamically
  $: totalAmount = get(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  function removeItem(index: number) {
    cart.update(items => {
      items.splice(index, 1);
      return [...items];
    });
  }

  function updateQuantity(index: number, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return; // Ensures event target is valid
    const quantity = parseInt(target.value, 10);
    if (quantity < 1) return; // Prevents negative or zero quantities
    cart.update(items => {
      items[index].quantity = quantity;
      return [...items];
    });
  }
</script>

<h1>Shopping Cart</h1>

{#if $cart.length > 0}
  <ul>
    {#each $cart as item, i}
      <li class="cart-item">
        {#if item.image}
          <img src={item.image} alt={item.name} />
        {/if}
        <div class="cart-info">
          <h2>{item.name}</h2>
          <p>Price: ${item.price.toFixed(2)}</p>
          <label>Quantity:</label>
          <input type="number" min="1" bind:value={item.quantity} on:change={(e) => updateQuantity(i, e)} />
          <button on:click={() => removeItem(i)}>Remove</button>
        </div>
      </li>
    {/each}
  </ul>

  <h3>Total: ${totalAmount.toFixed(2)}</h3>

  <a class="checkout-btn" href="/checkout">Proceed to Checkout</a>
{:else}
  <p>Your cart is empty.</p>
{/if}

<style>
  .cart-item { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
  .cart-item img { width: 50px; height: 50px; object-fit: cover; }
  .cart-info { display: flex; flex-direction: column; }
  input { width: 50px; padding: 5px; text-align: center; }
  .checkout-btn { display: block; padding: 10px; background: green; color: white; text-align: center; border-radius: 5px; }
</style>