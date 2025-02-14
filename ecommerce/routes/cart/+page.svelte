<script lang="ts">
    import { cart } from "$lib/stores/cart";
  
    function removeItem(index: number) {
      cart.update(items => {
        items.splice(index, 1);
        return [...items];
      });
    }
  </script>
  
  <h1>Shopping Cart</h1>
  {#if $cart.length > 0}
    {#each $cart as item, i}
      <div class="cart-item">
        <img src={item.image} alt={item.name} />
        <h2>{item.name}</h2>
        <p>{item.price}</p>
        <button on:click={() => removeItem(i)}>Remove</button>
      </div>
    {/each}
    <a href="/checkout">Proceed to Checkout</a>
  {:else}
    <p>Your cart is empty.</p>
  {/if}
  