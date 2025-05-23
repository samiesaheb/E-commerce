<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    isAuthenticated,
    logoutUser,
    fetchUserSession,
  } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { cart } from "$lib/stores/cart";

  let searchQuery = "";
  let isMenuOpen = false; // For mobile menu toggle
  let searchResults: { id: string; name: string }[] = []; // Store search suggestions
  let isDropdownOpen = false; // Control dropdown visibility
  let lastScrollY = 0; // Track last scroll position
  let isHeaderVisible = true; // Control header visibility

  // Fetch session on page load
  onMount(() => {
    fetchUserSession();

    // Add scroll event listener
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past 80px
        isHeaderVisible = false;
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        isHeaderVisible = true;
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  });

  // Fetch product suggestions as user types
  async function fetchSearchSuggestions(query: string) {
    if (!query.trim()) {
      searchResults = [];
      isDropdownOpen = false;
      return;
    }

    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const products: { id: string; name: string }[] = await response.json();
        searchResults = products
          .filter(product => product.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5); // Limit to 5 suggestions
        isDropdownOpen = searchResults.length > 0;
      } else {
        console.error('Failed to fetch products:', response.statusText);
        searchResults = [];
        isDropdownOpen = false;
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      searchResults = [];
      isDropdownOpen = false;
    }
  }

  // Handle search submission
  async function handleSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    searchQuery = "";
    searchResults = [];
    isDropdownOpen = false;
    await goto(`/shop?search=${encodeURIComponent(query)}`);
  }

  // Handle selecting a suggestion
  function selectSuggestion(productName: string) {
    searchQuery = productName;
    searchResults = [];
    isDropdownOpen = false;
    goto(`/shop/${productName.toLowerCase().replace(/\s+/g, "-")}`);
  }

  // Debounce search input to avoid excessive API calls
  let debounceTimer: NodeJS.Timeout;
  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSearchSuggestions(searchQuery), 300);
  }

  function logout() {
    logoutUser();
    goto("/login");
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar')) {
      isDropdownOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="layout">
  <!-- Navbar -->
  <nav class="navbar" class:hide={!isHeaderVisible}>
    <div class="nav-container">
      <!-- Logo -->
      <a href="/" class="logo">
        <img src="SH4.jpg" alt="Sky High International Logo" />
      </a>

      <!-- Main Navigation Links -->
      <div class="nav-links" class:open={isMenuOpen}>
        <div class="dropdown">
          <a href="/shop" class="nav-item dropbtn">Shop</a>
          <div class="dropdown-content">
            <a href="/shop?category=skin-care">Skin Care</a>
            <a href="/shop?category=body-care">Body Care</a>
            <a href="/shop?category=hair-care">Hair Care</a>
            <a href="/shop?category=baby-care">Baby Care</a>
            <a href="/shop?category=cosmetics">Cosmetics</a>
          </div>
        </div>
        <a href="/about" class="nav-item">About</a>
        <a href="/contact" class="nav-item">Contact</a>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <form class="search-form" on:submit|preventDefault={handleSearch}>
          <input
            type="text"
            class="search-input"
            placeholder="Search products..."
            bind:value={searchQuery}
            on:input={handleInput}
            autocomplete="off"
          />
          <button class="search-btn" type="submit" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="search-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35m1.9-6.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 017.05 10.5z"
              />
            </svg>
          </button>
        </form>
        {#if isDropdownOpen && searchResults.length > 0}
          <div class="search-dropdown">
            {#each searchResults as product}
              <a
                href={`/shop/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
                class="search-result"
                on:click|preventDefault={() => selectSuggestion(product.name)}
              >
                {product.name}
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- User Actions & Cart -->
      <div class="user-actions" class:open={isMenuOpen}>
        <a href="/cart" class="cart-link">
          <span class="cart-icon">🛒</span>
          <span class="cart-badge">{$cart.reduce((total, item) => total + item.quantity, 0)}</span>
        </a>
        {#if $isAuthenticated}
          <div class="dropdown">
            <button class="nav-item dropbtn">Account</button>
            <div class="dropdown-content">
              <a href="/profile">Profile</a>
              <button class="logout-btn" on:click={logout}>Logout</button>
            </div>
          </div>
        {:else}
          <a href="/login" class="nav-item">Login</a>
          <a href="/signup" class="nav-item signup">Sign Up</a>
        {/if}
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="menu-icon"
        >
          {#if isMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="content">
    <slot />
  </div>

  <!-- Footer -->
  <footer>
    <p>
      Follow us: <a href="https://www.instagram.com/skyhigh.inter" target="_blank">Instagram</a>
    </p>
    <p>© {new Date().getFullYear()} Sky High International Co., Ltd. All rights reserved.</p>
    <p>
      <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
    </p>
  </footer>
</div>

<style>
  /* Layout */
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    overflow-x: hidden;
  }

  /* Navbar */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 1rem 2rem;
    transition: transform 0.3s ease; /* Smooth slide effect */
  }

  .navbar.hide {
    transform: translateY(-100%); /* Slide up out of view */
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Logo */
  .logo img {
    height: 40px;
    width: auto;
    transition: transform 0.3s;
  }

  .logo:hover img {
    transform: scale(1.05);
  }

  /* Navigation Links */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-item {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    transition: color 0.3s;
    background: none;
    border: none;
    cursor: pointer;
  }

  .nav-item:hover {
    color: #EF0107;
  }

  /* Dropdown */
  .dropdown {
    position: relative;
  }

  .dropbtn {
    font-weight: 500;
    display: flex;
    align-items: center;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background: #ffffff;
    min-width: 180px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    z-index: 1;
    top: 100%;
    left: 0;
  }

  .dropdown-content a, .dropdown-content button {
    color: #333;
    padding: 0.75rem 1rem;
    text-decoration: none;
    display: block;
    font-size: 0.95rem;
    transition: background 0.3s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .dropdown-content a:hover, .dropdown-content button:hover {
    background: #f5f5f5;
    color: #EF0107;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  /* Search Bar */
  .search-bar {
    flex: 1;
    max-width: 400px;
    margin: 0 2rem;
    position: relative;
  }

  .search-form {
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 0; /* Rectangular search bar */
    overflow: hidden;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    font-size: 1rem;
    color: #333;
  }

  .search-btn {
    background: #EF0107;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 0;
  }

  .search-btn:hover {
    background: #ff8787;
  }

  .search-icon {
    width: 1.2em;
    height: 1.2em;
  }

  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }

  .search-result {
    display: block;
    padding: 0.75rem 1rem;
    color: #333;
    text-decoration: none;
    transition: background 0.3s;
  }

  .search-result:hover {
    background: #f5f5f5;
    color: #EF0107;
  }

  /* User Actions */
  .user-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .cart-link {
    position: relative;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #333;
  }

  .cart-icon {
    font-size: 1.5rem;
  }

  .cart-badge {
    position: absolute;
    top: -8px;
    right: -12px;
    background: #EF0107;
    color: white;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    border-radius: 50%;
    min-width: 20px;
    text-align: center;
  }

  .signup {
    background: #EF0107;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    transition: background 0.3s;
  }

  .signup:hover {
    background: #EF0107;
    color: white;
  }

  .logout-btn {
    color: #ff4444;
    font-weight: 500;
  }

  /* Mobile Menu Toggle */
  .menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .menu-icon {
    width: 1.5em;
    height: 1.5em;
  }

  /* Content */
  .content {
    margin-top: 80px; /* Match navbar height */
    width: 100vw;
    overflow-x: hidden;
    flex: 1;
  }

  /* Footer */
  footer {
    background: #2c3e50;
    color: #fff;
    text-align: center;
    padding: 2rem 1rem;
    margin-top: auto;
    width: 100vw;
  }

  footer a {
    color: #EF0107;
    text-decoration: none;
    font-weight: 500;
  }

  footer a:hover {
    text-decoration: underline;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .navbar {
      padding: 1rem;
    }

    .search-bar {
      max-width: 300px;
      margin: 0 1rem;
    }

    .search-dropdown {
      max-width: 300px;
    }
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-wrap: wrap;
      position: relative;
    }

    .menu-toggle {
      display: block;
    }

    .nav-links, .user-actions {
      display: none;
      flex-direction: column;
      width: 100%;
      background: #ffffff;
      padding: 1rem;
      position: absolute;
      top: 60px;
      left: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .nav-links.open, .user-actions.open {
      display: flex;
    }

    .dropdown-content {
      position: static;
      box-shadow: none;
      padding-left: 1rem;
    }

    .search-bar {
      order: -1;
      width: 100%;
      max-width: none;
      margin: 1rem 0;
    }

    .search-dropdown {
      width: 100%;
      max-width: none;
    }

    .content {
      margin-top: 120px;
    }
  }
</style>