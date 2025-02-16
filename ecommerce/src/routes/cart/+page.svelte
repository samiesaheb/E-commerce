<script lang="ts">
  import { cart } from "$lib/stores/cart";

  type CartItem = {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
  };

  function removeItem(index: number) {
    cart.update((items: CartItem[]) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }
</script>

<h1>Shopping Cart</h1>
{#if $cart.length > 0}
{#each $cart as item, i}
  <div class="cart-item">
    {#if item.image}
      <img src={item.image} alt={item.name} />
    {/if}
    <h2>{item.name}</h2>
    <p>Price: ${item.price.toFixed(2)}</p>
    <p>Quantity: {item.quantity}</p>
    <button on:click={() => removeItem(i)}>Remove</button>
  </div>
{/each}
<a href="/checkout">Proceed to Checkout</a>
{:else}
<p>Your cart is empty.</p>
{/if}