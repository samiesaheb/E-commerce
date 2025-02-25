<script lang="ts">
    import { goto } from "$app/navigation";

    let email = "";
    let password = "";
    let confirmPassword = "";
    let errorMessage = "";
    let successMessage = "";

    async function signup() {
        if (password !== confirmPassword) {
            errorMessage = "Passwords do not match!";
            successMessage = "";
            return;
        }

        try {
            const response = await fetch("/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                successMessage = "Signup successful! Redirecting to login...";
                errorMessage = "";
                setTimeout(() => {
                    goto("/login");
                }, 2000);
            } else {
                errorMessage = data.error || "Signup failed!";
                successMessage = "";
            }
        } catch (error) {
            errorMessage = "An unexpected error occurred. Please try again.";
            successMessage = "";
            console.error("Signup Error:", error);
        }
    }
</script>

<div class="signup-page">
    <div class="signup-container">
        <div class="header">
            <img src="/SH4.jpg" alt="Sky High International Logo" class="logo" />
            <h1>Create Account</h1>
            <p>Join us and start shopping today!</p>
        </div>

        <form on:submit|preventDefault={signup}>
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
            <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input 
                    type="password" 
                    id="confirm-password" 
                    bind:value={confirmPassword} 
                    placeholder="Confirm your password" 
                    required 
                />
            </div>
            <button type="submit" class="signup-btn">Sign Up</button>
            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}
            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}
        </form>

        <div class="footer-links">
            <p>Already have an account? <a href="/login" class="login-link">Sign In</a></p>
        </div>
    </div>
</div>

<style>
    .signup-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 2rem;
    }

    .signup-container {
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

    .signup-btn {
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

    .signup-btn:hover {
        background: #EF0107;
    }

    .error {
        color: #ff4444;
        font-size: 0.9rem;
        margin-top: 1rem;
        text-align: center;
    }

    .success {
        color: #28a745;
        font-size: 0.9rem;
        margin-top: 1rem;
        text-align: center;
    }

    .footer-links {
        margin-top: 1.5rem;
        text-align: center;
    }

    .footer-links p {
        color: #666;
        font-size: 0.9rem;
    }

    .login-link {
        color: #ff6b6b;
        text-decoration: none;
        font-weight: 500;
    }

    .login-link:hover {
        text-decoration: underline;
    }
</style>