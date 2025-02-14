<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    isAuthenticated,
    logoutUser,
    fetchUserSession,
  } from "$lib/stores/auth";
  import { onMount } from "svelte";

  let searchQuery = "";

  // ✅ Fetch session on page load
  onMount(fetchUserSession);

  async function handleSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    searchQuery = "";
    await goto(`/shop?search=${encodeURIComponent(query)}`);
  }

  function logout() {
    logoutUser();
    goto("/login");
  }
</script>

<div class="layout">
  <!-- ✅ Navbar stays at the top -->
  <nav>
    <div class="left-links">
      <a href="/">
        <img src="SH4.jpg" alt="Sky High Logo" />
      </a>
      <a href="/about">About</a>
      <a href="/shop">Shop</a>
      <a href="/contact">Contact</a>
    </div>

    <div class="center-search">
      <form class="search-form" on:submit|preventDefault={handleSearch}>
        <input
          type="text"
          class="search-input"
          placeholder="Search products..."
          bind:value={searchQuery}
        />
        <button class="search-button" type="submit" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            style="width: 1em; height: 1em;"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35m1.9-6.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 017.05 10.5z"
            />
          </svg>
        </button>
      </form>
    </div>

    <div class="right-link">
      {#if $isAuthenticated}
        <a href="/profile">Profile</a>
        <button class="logout-btn" on:click={logout}>Logout</button>
      {:else}
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      {/if}
    </div>
  </nav>

  <!-- ✅ Content starts below the navbar -->
  <div class="content">
    <slot />
  </div>

  <footer>
    <p>
      Follow us: <a
        href="https://www.instagram.com/skyhigh.inter"
        target="_blank">Instagram</a
      >
    </p>
    <p>
      &copy; {new Date().getFullYear()} Sky High International Co., Ltd. All rights
      reserved.
    </p>
    <p>
      <a href="/privacy">Privacy Policy</a> |
      <a href="/terms">Terms of Service</a>
    </p>
  </footer>
</div>

<style>
  /* ✅ Ensure the navbar stays at the top */
  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; /* Ensure it spans the full width */
    max-width: 100vw; /* Prevents accidental overflow */
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 0.5rem 1rem;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
    box-sizing: border-box; /* ✅ Prevents padding from affecting width */
  }

  /* Left Section (Logo & Links) */
  .left-links {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 150px;
    max-width: 30vw; /* ✅ Prevents it from taking too much space */
  }

  .center-search {
    display: flex;
    justify-content: center;
    flex: 1;
    min-width: 150px;
    max-width: 35vw; /* ✅ Prevents search bar from expanding too much */
  }

  .right-link {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    flex: 1;
    min-width: 150px;
    max-width: 30vw; /* ✅ Prevents it from pushing off-screen */
    white-space: nowrap;
    overflow: hidden;
  }

  .left-links img {
    height: 30px; /* Adjust height */
    width: auto; /* Maintain aspect ratio */
  }

  .center-search {
    margin: 0 1rem;
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }

  .search-form {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 250px; /* Prevents search bar from growing too large */
  }

  .search-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px 0 0 5px;
  }

  .search-button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background: #007bff;
    color: white;
    border: 1px solid #007bff;
    border-radius: 0 5px 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logout-btn {
    background: none;
    border: none;
    color: red;
    cursor: pointer;
    font-size: 1rem;
  }

  /* ✅ Make the layout take the full page height */
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw; /* ✅ Ensures full width */
    box-sizing: border-box; /* ✅ Prevents padding from affecting width */
  }

  .content {
    margin-top: 80px;
    width: 100%; /* ✅ Prevents content from shrinking */
    max-width: 100vw; /* ✅ Ensures it doesn't exceed the screen width */
    overflow-x: hidden;
  }

  /* ✅ Ensure the footer sticks to the bottom */
  footer {
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 1rem;
    margin-top: auto; /* Pushes the footer to the bottom */
    width: 100%;
  }

  footer {
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 1rem;
    margin-top: auto;
  }

  footer a {
    color: #ffffff;
    text-decoration: none;
    font-weight: bold;
  }

  footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    nav {
      flex-wrap: wrap; /* ✅ Allows navbar items to wrap */
      padding: 0.5rem;
    }

    .left-links,
    .right-link {
      flex: 1 1 100%; /* ✅ Forces sections to take full width */
      justify-content: center;
      text-align: center;
    }

    .center-search {
      flex: 1 1 100%;
      max-width: 80%;
    }
  }
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100vw; /* Ensure it exactly matches the screen width */
    overflow-x: hidden; /* Prevents any unwanted horizontal scroll */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box; /* ✅ Ensures padding doesn’t affect width */
  }

  nav,
  .layout,
  .content {
    width: 100vw; /* ✅ Ensures they span the full screen width */
    max-width: 100vw; /* ✅ Prevents overflow */
  }
</style>
