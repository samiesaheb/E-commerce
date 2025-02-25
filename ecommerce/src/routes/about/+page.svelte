<script lang="ts">
  import { onMount } from 'svelte';

  let teamMembers = [
      { name: "John Doe", role: "Founder & CEO", image: "/team/john.jpg" },
      { name: "Jane Smith", role: "Head of R&D", image: "/team/jane.jpg" },
      { name: "Mike Johnson", role: "Production Manager", image: "/team/mike.jpg" }
  ];
</script>

<div class="about-container">
  <!-- Hero Section -->
  <section class="hero">
      <h1>About Sky High International</h1>
      <p class="subtitle">Crafting Beauty with Passion and Precision Since 2000</p>
  </section>

  <!-- Our Story -->
  <section class="section story">
      <div class="content-grid">
          <div class="text-content">
              <h2>Our Story</h2>
              <p>Established in 2000, <strong>Sky High International Co., Ltd.</strong> began with a vision to redefine beauty through quality and innovation. As a premier private label (OEM) manufacturer, we specialize in skin care, body care, hair care, baby care, and cosmetics, serving clients worldwide with a commitment to excellence.</p>
          </div>
          <div class="image-content">
              <img src="/about/story.jpg" alt="Our manufacturing facility" class="story-image" />
          </div>
      </div>
  </section>

  <!-- Mission & Vision -->
  <section class="section mission-vision">
      <div class="mv-grid">
          <div class="mission">
              <h2>Our Mission</h2>
              <p>To bring the best to everything we touch and be the best in everything we do. We use carefully selected, regulation-compliant raw materials and time-tested recipes to create safe, high-quality products.</p>
          </div>
          <div class="vision">
              <h2>Our Vision</h2>
              <p>To lead the global cosmetic industry with innovative, high-quality, and eco-friendly products while expanding markets and upholding customer satisfaction.</p>
          </div>
      </div>
  </section>

  <!-- Our Brands -->
  <section class="section brands">
      <h2>Our Brands</h2>
      <div class="brands-grid">
          <div class="brand-card">
              <img src="/brands/geometry.jpg" alt="Geometry Brand" class="brand-image" />
              <h3>Geometry</h3>
              <p>Premium formulations for discerning customers</p>
          </div>
          <div class="brand-card">
              <img src="/brands/iffa.jpg" alt="Iffa Brand" class="brand-image" />
              <h3>Iffa</h3>
              <p>Trendy, affordable products with mass appeal</p>
          </div>
      </div>
  </section>

  <!-- Facilities & Certifications -->
  <section class="section facilities">
      <div class="content-grid reverse">
          <div class="text-content">
              <h2>Our Facilities & Certifications</h2>
              <p>Our state-of-the-art manufacturing facilities prioritize quality control. Certified with <strong>ISO 9001:2015</strong>, we maintain the highest industry standards to ensure product excellence and customer trust.</p>
          </div>
          <div class="image-content">
              <img src="/about/facility.jpg" alt="Our facility" class="facility-image" />
          </div>
      </div>
  </section>

  <!-- Why Choose Us -->
  <section class="section why-choose">
      <h2>Why Choose Us?</h2>
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

  <!-- Team Section -->
  <section class="section team">
      <h2>Our Team</h2>
      <div class="team-grid">
          {#each teamMembers as member}
              <div class="team-card">
                  <img src={member.image} alt={member.name} class="team-image" />
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
              </div>
          {/each}
      </div>
  </section>
</div>

<style>
  .about-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
  }

  .hero {
      text-align: center;
      padding: 4rem 0;
      background: linear-gradient(to right, #f9f9f9, #fff);
      margin-bottom: 3rem;
  }

  .hero h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 1rem;
  }

  .subtitle {
      font-size: 1.2rem;
      color: #666;
  }

  .section {
      margin-bottom: 4rem;
  }

  h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 2rem;
  }

  .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
  }

  .content-grid.reverse {
      direction: rtl;
  }

  .content-grid.reverse > * {
      direction: ltr;
  }

  .story-image, .facility-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .mv-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      background: #f9f9f9;
      padding: 2rem;
      border-radius: 8px;
  }

  .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
  }

  .brand-card {
      text-align: center;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s;
  }

  .brand-card:hover {
      transform: translateY(-5px);
  }

  .brand-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 1rem;
  }

  .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
  }

  .feature-card {
      padding: 1.5rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      text-align: center;
  }

  .feature-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 1rem;
  }

  .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
  }

  .team-card {
      text-align: center;
      padding: 1rem;
  }

  .team-image {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
  }

  p {
      color: #666;
      line-height: 1.6;
  }

  strong {
      color: #333;
  }
</style>