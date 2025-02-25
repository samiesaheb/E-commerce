<script lang="ts">
  import { onMount } from 'svelte';
  
  // Define product type for featured products
  interface FeaturedProduct {
      id: string;
      name: string;
      price: number;
      image: string;
      description: string;
  }

  let featuredProducts: FeaturedProduct[] = [];

  onMount(async () => {
      // Fetch featured products (you'd replace this with your actual API call)
      try {
          const response = await fetch('/api/products?featured=true');
          if (response.ok) {
              featuredProducts = await response.json();
          }
      } catch (error) {
          console.error('Error fetching featured products:', error);
      }
  });

  // Function to generate product slug from name
  function generateSlug(name: string): string {
      return name.toLowerCase().replace(/\s+/g, '-');
  }
</script>

<div class="home-container">
  <!-- Hero Section -->
  <section class="hero">
      <div class="hero-content">
          <h1>Welcome to Sky High International</h1>
          <p class="hero-subtitle">Discover Premium Quality Cosmetics for Every Need</p>
          <a href="/shop" class="shop-now-btn">Shop Now</a>
      </div>
  </section>

  <!-- Featured Products -->
  {#if featuredProducts.length > 0}
      <section class="featured-products">
          <h2>Featured Products</h2>
          <div class="product-grid">
              {#each featuredProducts as product}
                  <div class="product-card">
                      <img src={product.image} alt={product.name} class="product-image" />
                      <div class="product-info">
                          <h3>{product.name}</h3>
                          <p class="price">${product.price.toFixed(2)}</p>
                          <a href={`/shop/${generateSlug(product.name)}`} class="view-product">
                              View Product
                          </a>
                      </div>
                  </div>
              {/each}
          </div>
      </section>
  {/if}

  <!-- About Section -->
  <section class="about">
      <div class="about-grid">
          <div class="mission">
              <h2>Our Mission</h2>
              <p>To bring the best to everything we touch and to be the best in everything we do. We ensure all our products meet the highest quality standards using carefully selected, regulation-compliant raw materials and time-tested recipes.</p>
          </div>
          <div class="vision">
              <h2>Our Vision</h2>
              <p>To be a globally recognized leader in cosmetics through innovative, high-quality, and eco-friendly products while expanding markets and maintaining customer satisfaction.</p>
          </div>
      </div>
  </section>

  <!-- Product Categories -->
  <section class="categories">
      <h2>Explore Our Range</h2>
      <div class="category-grid">
          <div class="category-card">
              <h3>Skin Care</h3>
              <a href="/shop?category=skin-care" class="category-link">Shop Now</a>
          </div>
          <div class="category-card">
              <h3>Body Care</h3>
              <a href="/shop?category=body-care" class="category-link">Shop Now</a>
          </div>
          <div class="category-card">
              <h3>Hair Care</h3>
              <a href="/shop?category=hair-care" class="category-link">Shop Now</a>
          </div>
          <div class="category-card">
              <h3>Baby Care</h3>
              <a href="/shop?category=baby-care" class="category-link">Shop Now</a>
          </div>
          <div class="category-card">
              <h3>Cosmetics</h3>
              <a href="/shop?category=cosmetics" class="category-link">Shop Now</a>
          </div>
      </div>
  </section>

  <!-- Why Choose Us -->
  <section class="why-choose-us">
      <h2>Why Choose Sky High?</h2>
      <div class="features-grid">
          <div class="feature-card">
              <span class="feature-icon">🏆</span>
              <p>20+ Years Experience</p>
          </div>
          <div class="feature-card">
              <span class="feature-icon">🔬</span>
              <p>Advanced R&D Labs</p>
          </div>
          <div class="feature-card">
              <span class="feature-icon">✅</span>
              <p>Quality Assurance</p>
          </div>
          <div class="feature-card">
              <span class="feature-icon">🤝</span>
              <p>Flexible Manufacturing</p>
          </div>
          <div class="feature-card">
              <span class="feature-icon">💰</span>
              <p>Competitive Pricing</p>
          </div>
      </div>
  </section>
</div>

<style>
  .home-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
  }

  /* Hero Section */
  .hero {
      background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-image.jpg');
      background-size: cover;
      background-position: center;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      margin-bottom: 3rem;
  }

  .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
  }

  .hero-subtitle {
      font-size: 1.5rem;
      margin-bottom: 2rem;
  }

  .shop-now-btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: #EF0107;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      transition: background 0.3s;
  }

  .shop-now-btn:hover {
      background: #ff8787;
  }

  /* Featured Products */
  .featured-products {
      margin-bottom: 4rem;
  }

  .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
  }

  .product-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s;
  }

  .product-card:hover {
      transform: translateY(-5px);
  }

  .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
  }

  .product-info {
      padding: 1rem;
      text-align: center;
  }

  .price {
      color: #EF0107;
      font-weight: bold;
      margin: 0.5rem 0;
  }

  .view-product {
      color: #333;
      text-decoration: none;
  }

  .view-product:hover {
      color: #EF0107;
  }

  /* About Section */
  .about {
      margin-bottom: 4rem;
      background: #f9f9f9;
      padding: 3rem 2rem;
  }

  .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
  }

  /* Categories */
  .categories {
      margin-bottom: 4rem;
  }

  .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
  }

  .category-card {
      background: #fff;
      padding: 2rem;
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s;
  }

  .category-card:hover {
      transform: translateY(-5px);
  }

  .category-link {
      color: #EF0107;
      text-decoration: none;
      font-weight: bold;
  }

  .category-link:hover {
      text-decoration: underline;
  }

  /* Why Choose Us */
  .why-choose-us {
      background: #fff;
      padding: 3rem 0;
      text-align: center;
  }

  .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 2rem auto;
  }

  .feature-card {
      padding: 1.5rem;
      background: #f9f9f9;
      border-radius: 8px;
  }

  .feature-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 1rem;
  }

  h2 {
      margin-bottom: 2rem;
      color: #333;
  }
</style>