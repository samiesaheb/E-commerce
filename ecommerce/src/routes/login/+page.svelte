<script lang="ts">
    import { goto } from "$app/navigation";
    import { setAuthToken, setUser } from "$lib/stores/auth";

    let email = "";
    let password = "";
    let errorMessage = "";

    async function login() {
        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" // ✅ Ensure cookies are sent
            });

            const data = await response.json();

            if (response.ok) {
                setAuthToken("session"); // ✅ Mark user as logged in
                setUser({ email }); // ✅ Store user details
                errorMessage = "";
                goto("/profile"); // ✅ Redirect to profile after login
            } else {
                errorMessage = data.error || "An error occurred. Try again.";
            }
        } catch (error) {
            console.error("❌ Login Error:", error);
            errorMessage = "An unexpected error occurred.";
        }
    }
</script>

  
  <style>
    .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border-radius: 8px;
        background: #fff;
        color: black;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    input {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    button {
        width: 100%;
        padding: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background: #0056b3;
    }
    .error {
        color: red;
        font-weight: bold;
    }

    .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border-radius: 8px;
        background: #fff;
        color: black;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        justify-content: center; /* Centers the form inside the container */
        align-items: center; /* Ensures all elements inside are centered */
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center; /* Center inputs & button horizontally */
        width: 100%;
    }

    input {
        width: 100%; /* Take full width of the form */
        max-width: 300px; /* Prevents inputs from stretching too wide */
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        text-align: center; /* Center text inside input */
    }

    button {
        width: 100%;
        max-width: 300px; /* Matches input width */
        padding: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background: #0056b3;
    }

    .error {
        color: red;
        font-weight: bold;
        margin-top: 10px;
    }

  </style>
  
  <div class="login-container">
    <h2>Login</h2>
  
    <form on:submit|preventDefault={login}>
        <input type="email" bind:value={email} placeholder="Email" required />
        <input type="password" bind:value={password} placeholder="Password" required />
  
        <button type="submit">Login</button>
  
        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}
    </form>
  
    <p>Don't have an account? <a href="/signup">Sign up here</a></p>
  </div>
  