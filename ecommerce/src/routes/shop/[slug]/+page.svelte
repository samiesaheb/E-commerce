<script lang="ts">
  import { cart, addToCart, updateCartQuantity } from "$lib/stores/cart";
  import { user } from "$lib/stores/auth";
  import { get } from "svelte/store";
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
      reviews?: { userId: string; rating: number; comment: string; date: string }[];
    };
    relatedProducts: { id: string; name: string; price: number; image: string }[];
  };

  $: cartItems = $cart;
  let selectedQuantity = 1;
  let rating = 5;
  let comment = "";
  let userLoggedIn = !!get(user);

  function handleAddToCart() {
    if (!userLoggedIn) {
      alert("Please log in to add items to your cart.");
      return;
    }
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
    selectedQuantity = 1;
  }

  function incrementQuantity(eventOrProduct?: MouseEvent | { id: string; stock?: number }) {
    if (!eventOrProduct || 'id' in eventOrProduct) {
      // Called with a product (for cart adjustments)
      const product = eventOrProduct as { id: string; stock?: number };
      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem && product.stock !== undefined && existingItem.quantity >= product.stock) {
        alert("Cannot add more than available stock.");
        return;
      }
      if (existingItem) {
        updateCartQuantity(product.id, existingItem.quantity + 1);
        return;
      }
    }
    // Called as an event handler (for selectedQuantity)
    if (!data.product || (data.product.stock && selectedQuantity >= data.product.stock)) return;
    selectedQuantity += 1;
  }

  function decrementQuantity(eventOrProduct?: MouseEvent | { id: string }) {
    if (!eventOrProduct || 'id' in eventOrProduct) {
      // Called with a product (for cart adjustments)
      const product = eventOrProduct as { id: string };
      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem && existingItem.quantity > 1) {
        updateCartQuantity(product.id, existingItem.quantity - 1);
      } else if (existingItem && existingItem.quantity === 1) {
        updateCartQuantity(product.id, 0);
      }
      return;
    }
    // Called as an event handler (for selectedQuantity)
    if (selectedQuantity > 1) selectedQuantity -= 1;
  }

  async function submitReview(event: Event) {
    event.preventDefault();
    if (!userLoggedIn) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!data.product) return;

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(`/api/products/${data.product.id}/reviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ rating, comment })
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        data.product.reviews = updatedProduct.reviews;
        rating = 5;
        comment = "";
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      alert("An error occurred while submitting your review.");
    }
  }
</script>

<div class="product-page">
  {#if data.product}
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
      <div class="product-image">
        <img src={data.product.image} alt={data.product.name} />
      </div>
      <div class="product-details">
        <h1>{data.product.name}</h1>
        <div class="price">${data.product.price.toFixed(2)}</div>
        {#if data.product.stock !== undefined}
          <div class="stock">
            {data.product.stock > 0 ? `In Stock (${data.product.stock} available)` : "Out of Stock"}
          </div>
        {/if}
        <p class="description">{data.product.description}</p>

        {#if userLoggedIn}
          <div class="cart-controls">
            {#if data.product.stock === 0}
              <button class="out-of-stock" disabled>Out of Stock</button>
            {:else if cartItems.some(item => item.id === data.product!.id)}
              <div class="quantity-controls">
                <button on:click={() => decrementQuantity(data.product!)}>-</button>
                <span>{cartItems.find(item => item.id === data.product!.id)?.quantity || 0}</span>
                <button on:click={() => incrementQuantity(data.product!)}>+</button>
              </div>
              {#if (cartItems.find(item => item.id === data.product!.id)?.quantity || 0) > 0}
                <button class="added-to-cart" disabled>Added to Cart</button>
              {/if}
            {:else}
              <div class="quantity-controls">
                <button on:click={decrementQuantity}>-</button>
                <span>{selectedQuantity}</span>
                <button on:click={incrementQuantity}>+</button>
              </div>
              <button class="add-to-cart" on:click={handleAddToCart}>Add to Cart</button>
            {/if}
          </div>
        {/if}

        <div class="additional-info">
          <p><strong>Category:</strong> {data.product.category || 'N/A'}</p>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="reviews-section">
      <h2>Customer Reviews</h2>
      {#if data.product.reviews && data.product.reviews.length > 0}
        {#each data.product.reviews as review}
          <div class="review">
            <p>{review.rating} ★ - {review.comment}</p>
            <p class="review-date">{new Date(review.date).toLocaleDateString()}</p>
          </div>
        {/each}
      {:else}
        <p class="placeholder">No reviews yet. Be the first to review this product!</p>
      {/if}
      {#if userLoggedIn}
        <form on:submit|preventDefault={submitReview} class="review-form">
          <label for="rating">Rating (1-5):</label>
          <input id="rating" type="number" min="1" max="5" bind:value={rating} />
          <label for="comment">Comment:</label>
          <textarea id="comment" bind:value={comment} placeholder="Write your review..."></textarea>
          <button type="submit">Submit Review</button>
        </form>
      {:else}
        <p>Please <a href="/login">log in</a> to submit a review.</p>
      {/if}
    </div>

    <!-- Related Products -->
    {#if data.relatedProducts && data.relatedProducts.length > 0}
      <div class="related-products">
        <h2>Related Products</h2>
        <div class="product-grid">
          {#each data.relatedProducts as product}
            <a href={`/shop/${product.name.toLowerCase().replace(/\s+/g, "-")}`} class="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p class="price">${product.price.toFixed(2)}</p>
            </a>
          {/each}
        </div>
      </div>
    {/if}
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
    color: #EF0107;
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

  .review {
    margin-bottom: 1rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 1rem;
  }

  .review-date {
    font-size: 0.8rem;
    color: #999;
  }

  .placeholder {
    color: #666;
    font-style: italic;
  }

  .review-form {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .review-form label {
    font-weight: 500;
    color: #333;
  }

  .review-form input,
  .review-form textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }

  .review-form textarea {
    height: 100px;
    resize: vertical;
  }

  .review-form button {
    padding: 0.75rem 1.5rem;
    background: #EF0107;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .review-form button:hover {
    background: #ff8787;
  }

  .related-products {
    margin-top: 3rem;
  }

  .related-products h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .product-card {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s;
  }

  .product-card:hover {
    transform: translateY(-5px);
  }

  .product-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 0.75rem;
  }

  .product-card h3 {
    font-size: 1rem;
    color: #333;
    margin: 0 0 0.5rem;
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
    background: #EF0107;
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