<script lang="ts">
  import { cart, addToCart, updateCartQuantity } from "$lib/stores/cart";
  import { goto } from "$app/navigation";

  export let data: { 
    product?: { 
      id: string;
      name: string; 
      description: string; 
      image: string; 
      price: number;
      stock?: number;
      category?: string;
    } 
  };

  // Auto-subscribe to the cart store
  $: cartItems = $cart;
  $: console.log('Cart Items:', cartItems); // Debug cart state

  let selectedQuantity = 1;

  function handleAddToCart() {
    if (!data.product) return;

    const existingItem = cartItems.find(item => item.id === data.product!.id);
    if (existingItem) {
      updateCartQuantity(data.product!.id, existingItem.quantity + selectedQuantity);
    } else {
      addToCart({
        id: data.product!.id,
        name: data.product!.name,
        price: data.product!.price,
        image: data.product!.image
      });
      if (selectedQuantity > 1) {
        updateCartQuantity(data.product!.id, selectedQuantity);
      }
    }
    selectedQuantity = 1; // Reset after adding
  }

  function incrementQuantity() {
    if (!data.product || (data.product.stock && selectedQuantity >= data.product.stock)) return;
    selectedQuantity += 1;
  }

  function decrementQuantity() {
    if (selectedQuantity > 1) selectedQuantity -= 1;
  }

  function decrementCartQuantity() {
    if (!data.product) return;

    const existingItem = cartItems.find(item => item.id === data.product!.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity - 1;
      console.log(`Decrementing ${data.product!.id} from ${existingItem.quantity} to ${newQuantity}`);
      updateCartQuantity(data.product!.id, newQuantity);
    }
  }

  function incrementCartQuantity() {
    if (!data.product || (data.product.stock && (cartItems.find(item => item.id === data.product!.id)?.quantity || 0) >= data.product.stock)) return;
    const existingItem = cartItems.find(item => item.id === data.product!.id);
    if (existingItem) {
      updateCartQuantity(data.product!.id, existingItem.quantity + 1);
    }
  }
</script>

<div class="product-page">
  {#if data.product}
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <a href="/shop">Shop</a>
      {#if data.product.category}
        <span> / </span>
        <a href={`/shop?category=${data.product.category.toLowerCase()}`}>
          {data.product.category}
        </a>
      {/if}
      <span> / </span>
      <span>{data.product.name}</span>
    </div>

    <div class="product-container">
      <!-- Product Image -->
      <div class="product-image">
        <img src={data.product.image} alt={data.product.name} />
      </div>

      <!-- Product Details -->
      <div class="product-details">
        <h1>{data.product.name}</h1>
        <div class="price">${data.product.price.toFixed(2)}</div>
        {#if data.product.stock !== undefined}
          <div class="stock">
            {data.product.stock > 0 ? `In Stock (${data.product.stock} available)` : "Out of Stock"}
          </div>
        {/if}
        <p class="description">{data.product.description}</p>

        <!-- Quantity and Add to Cart -->
        <div class="cart-controls">
          {#if data.product.stock === 0}
            <button class="out-of-stock" disabled>Out of Stock</button>
          {:else}
            {#if cartItems.some(item => item.id === data.product!.id)}
              <div class="quantity-controls">
                <button on:click={decrementCartQuantity}>-</button>
                <span>{cartItems.find(item => item.id === data.product!.id)?.quantity || 0}</span>
                <button on:click={incrementCartQuantity}>+</button>
              </div>
              <button class="added-to-cart" disabled>Added to Cart</button>
            {:else}
              <div class="quantity-controls">
                <button on:click={decrementQuantity}>-</button>
                <span>{selectedQuantity}</span>
                <button on:click={incrementQuantity}>+</button>
              </div>
              <button class="add-to-cart" on:click={handleAddToCart}>Add to Cart</button>
            {/if}
          {/if}
        </div>

        <!-- Additional Info -->
        <div class="additional-info">
          <p><strong>Category:</strong> {data.product.category || 'N/A'}</p>
        </div>
      </div>
    </div>

    <!-- Reviews Placeholder -->
    <div class="reviews-section">
      <h2>Customer Reviews</h2>
      <p class="placeholder">No reviews yet. Be the first to review this product!</p>
    </div>
  {:else}
    <div class="not-found">
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <a href="/shop" class="shop-link">Back to Shop</a>
    </div>
  {/if}
</div>

<style>
  .product-page {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .breadcrumbs {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .breadcrumbs a {
    color: #EF0107;
    text-decoration: none;
  }

  .breadcrumbs a:hover {
    text-decoration: underline;
  }

  .breadcrumbs span {
    margin: 0 0.5rem;
  }

  .product-container {
    display: flex;
    gap: 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .product-image {
    flex: 1;
    max-width: 500px;
  }

  .product-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  .product-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin: 0;
  }

  .price {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ff6b6b;
  }

  .stock {
    font-size: 1rem;
    color: #28a745;
  }

  .stock.out-of-stock {
    color: #ff4444;
  }

  .description {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
  }

  .cart-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.2rem;
  }

  .quantity-controls button {
    width: 30px;
    height: 30px;
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .quantity-controls button:hover {
    background: #ddd;
  }

  .quantity-controls span {
    min-width: 30px;
    text-align: center;
    font-weight: 500;
  }

  .add-to-cart, .out-of-stock, .added-to-cart {
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .add-to-cart {
    background: #EF0107;
    color: white;
  }

  .add-to-cart:hover {
    background: #ff8787;
  }

  .out-of-stock {
    background: #ccc;
    color: #666;
    cursor: not-allowed;
  }

  .added-to-cart {
    background: #28a745;
    color: white;
    cursor: default;
  }

  .additional-info {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .additional-info strong {
    color: #333;
  }

  .reviews-section {
    margin-top: 3rem;
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 8px;
  }

  .reviews-section h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .placeholder {
    color: #666;
    font-style: italic;
  }

  .not-found {
    text-align: center;
    padding: 4rem 0;
  }

  .not-found h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .not-found p {
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .shop-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #EF0107 ;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.3s;
  }

  .shop-link:hover {
    background: #ff8787;
  }

  @media (max-width: 768px) {
    .product-container {
      flex-direction: column;
      padding: 1rem;
    }

    .product-image {
      max-width: 100%;
    }

    .cart-controls {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>