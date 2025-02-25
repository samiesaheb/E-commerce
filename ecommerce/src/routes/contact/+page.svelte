<script lang="ts">
  import { onMount } from 'svelte';

  let formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
  };
  let submitted = false;
  let error = '';

  async function handleSubmit() {
      try {
          const response = await fetch('/api/contact', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData)
          });

          if (response.ok) {
              submitted = true;
              formData = { name: '', email: '', subject: '', message: '' };
          } else {
              const errorData = await response.json(); // Parse the error response from the server
              error = errorData.details 
                  ? `Failed to send message: ${errorData.details}` 
                  : errorData.error || 'Failed to send message. Please try again.';
          }
      } catch (err) {
          // Type guard to check if err is an Error object
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          error = `An error occurred: ${errorMessage}. Please try again later.`;
          console.error('Contact form submission error:', err);
      }
  }
</script>

<div class="contact-container">
  <!-- Header -->
  <section class="header">
      <h1>Contact Us</h1>
      <p class="subtitle">We'd love to hear from you! Get in touch with Sky High International.</p>
  </section>

  <!-- Contact Info and Form -->
  <section class="contact-section">
      <div class="contact-grid">
          <!-- Contact Information -->
          <div class="contact-info">
              <h2>Sky High International Co., Ltd</h2>
              <div class="info-item">
                  <span class="icon">📍</span>
                  <p>Village No. 7, No. 524 Bang Pu Mai<br>Mueang Samut Prakan District<br>Samut Prakan 10280, Thailand</p>
              </div>
              <div class="info-item">
                  <span class="icon">✉️</span>
                  <p><a href="mailto:samie@skyhigh.co.th" class="email-link">samie@skyhigh.co.th</a></p>
              </div>
              <div class="office-image">
                  <img 
                      src="SkyHighFront2.JPG" 
                      alt="Sky High International Co., Ltd Office" 
                      class="office-photo"
                  />
              </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form">
              {#if submitted}
                  <div class="success-message">
                      <h3>Thank You!</h3>
                      <p>Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
              {:else}
                  <h2>Send Us a Message</h2>
                  {#if error}
                      <p class="error">{error}</p>
                  {/if}
                  <form on:submit|preventDefault={handleSubmit}>
                      <div class="form-group">
                          <label for="name">Name</label>
                          <input 
                              id="name" 
                              type="text" 
                              bind:value={formData.name} 
                              required 
                              placeholder="Your Name"
                          />
                      </div>
                      <div class="form-group">
                          <label for="email">Email</label>
                          <input 
                              id="email" 
                              type="email" 
                              bind:value={formData.email} 
                              required 
                              placeholder="Your Email"
                          />
                      </div>
                      <div class="form-group">
                          <label for="subject">Subject</label>
                          <input 
                              id="subject" 
                              type="text" 
                              bind:value={formData.subject} 
                              required 
                              placeholder="Subject"
                          />
                      </div>
                      <div class="form-group">
                          <label for="message">Message</label>
                          <textarea 
                              id="message" 
                              bind:value={formData.message} 
                              required 
                              placeholder="Your Message"
                              rows="5"
                          ></textarea>
                      </div>
                      <button type="submit" class="submit-btn">Send Message</button>
                  </form>
              {/if}
          </div>
      </div>
  </section>

  <!-- Map Section -->
  <section class="map-section">
      <h2>Find Us</h2>
      <div class="map-container">
          <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.0032492159744!2d100.62949107525492!3d13.535391886834283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d59ceaaaaaaab%3A0xf32601aaee792057!2sSky%20High%20International%20Co.%2CLtd.!5e0!3m2!1sen!2sth!4v1740473543624!5m2!1sen!2sth" 
              width="100%" 
              height="400" 
              style="border:0;" 
              allowfullscreen 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"
              title="Sky High International Co., Ltd Location Map"
          ></iframe>
      </div>
  </section>
</div>

<style>
  .contact-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
  }

  .header {
      text-align: center;
      padding: 3rem 0;
      background: #f9f9f9;
      margin-bottom: 3rem;
  }

  .header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 1rem;
  }

  .subtitle {
      font-size: 1.2rem;
      color: #666;
  }

  .contact-section {
      margin-bottom: 4rem;
  }

  .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
  }

  .contact-info {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.5rem;
  }

  .icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      margin-top: 0.2rem;
  }

  .email-link {
      color: #ff6b6b;
      text-decoration: none;
  }

  .email-link:hover {
      text-decoration: underline;
  }

  .office-photo {
      width: 100%;
      max-width: 400px;
      height: auto;
      border-radius: 8px;
      margin-top: 2rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .contact-form {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .form-group {
      margin-bottom: 1.5rem;
  }

  label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
  }

  input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      color: #333;
  }

  textarea {
      resize: vertical;
  }

  .submit-btn {
      background: #ff6b6b;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s;
  }

  .submit-btn:hover {
      background: #ff8787;
  }

  .success-message {
      text-align: center;
      padding: 2rem;
  }

  .error {
      color: #ff4444;
      margin-bottom: 1rem;
  }

  .map-section {
      margin-bottom: 4rem;
  }

  .map-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
  }

  p {
      color: #666;
      line-height: 1.6;
  }
</style>