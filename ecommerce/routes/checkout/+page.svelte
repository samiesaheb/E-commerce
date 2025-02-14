<script lang="ts">
    import { cart } from "$lib/stores/cart";
    import { goto } from "$app/navigation";
  
    let name = "";
    let address = "";
  
    async function placeOrder() {
      const res = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ name, address, items: $cart }),
        headers: { "Content-Type": "application/json" }
      });
  
      if (res.ok) {
        cart.set([]); // Clear cart
        goto("/order/success");
      }
    }
  </script>
  
  <h1>Checkout</h1>
  <input type="text" bind:value={name} placeholder="Your Name" required />
  <input type="text" bind:value={address} placeholder="Your Address" required />
  <button on:click={placeOrder}>Place Order</button>
  