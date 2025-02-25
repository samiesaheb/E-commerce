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
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                setAuthToken("session");
                setUser({ email });
                errorMessage = "";
                goto("/profile");
            } else {
                errorMessage = data.error || "An error occurred. Please try again.";
            }
        } catch (error) {
            console.error("❌ Login Error:", error);
            errorMessage = "An unexpected error occurred.";
        }
    }
</script>

<div class="login-page">
    <div class="login-container">
        <div class="header">
            <img src="/SH4.jpg" alt="Sky High International Logo" class="logo" />
            <h1>Sign In</h1>
            <p>Welcome back! Please enter your credentials.</p>
        </div>

        <form on:submit|preventDefault={login}>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    bind:value={email} 
                    placeholder="Enter your email" 
                    required 
                />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    bind:value={password} 
                    placeholder="Enter your password" 
                    required 
                />
            </div>
            <button type="submit" class="login-btn">Sign In</button>
            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}
        </form>

        <div class="footer-links">
            <a href="/forgot-password" class="forgot-password">Forgot Password?</a>
            <p>Don't have an account? <a href="/signup" class="signup-link">Sign Up</a></p>
        </div>
    </div>
</div>

<style>
    .login-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 2rem;
    }

    .login-container {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        width: 100%;
        max-width: 450px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .logo {
        height: 60px;
        width: auto;
        margin-bottom: 1rem;
    }

    h1 {
        font-size: 2rem;
        color: #2c3e50;
        margin: 0;
    }

    .header p {
        color: #666;
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
        width: 100%;
    }

    label {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 0.5rem;
        text-align: left;
    }

    input {
        width: 100%;
        padding: 0.9rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
        color: #333;
        transition: border-color 0.3s;
    }

    input:focus {
        border-color: #EF0107;
        outline: none;
    }

    .login-btn {
        width: 100%;
        padding: 1rem;
        background: #EF0107;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s;
    }

    .login-btn:hover {
        background: #EF0107;
    }

    .error {
        color: #ff4444;
        font-size: 0.9rem;
        margin-top: 1rem;
        text-align: center;
    }

    .footer-links {
        margin-top: 1.5rem;
        text-align: center;
    }

    .forgot-password {
        color: #EF0107;
        font-size: 0.9rem;
        text-decoration: none;
        display: block;
        margin-bottom: 0.5rem;
    }

    .forgot-password:hover {
        text-decoration: underline;
    }

    .footer-links p {
        color: #666;
        font-size: 0.9rem;
    }

    .signup-link {
        color: #EF0107;
        text-decoration: none;
        font-weight: 500;
    }

    .signup-link:hover {
        text-decoration: underline;
    }
</style>