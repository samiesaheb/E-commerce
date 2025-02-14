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
            return;
        }

        try {
            const response = await fetch("/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Signup Response:", data);

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

<style>
    .signup-container {
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
        width: 100%;
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

    .success {
        color: green;
        font-weight: bold;
        margin-top: 10px;
    }
</style>

<div class="signup-container">
    <h2>Sign Up</h2>

    <form on:submit|preventDefault={signup}>
        <input type="email" bind:value={email} placeholder="Email" required />
        <input type="password" bind:value={password} placeholder="Password" required />
        <input type="password" bind:value={confirmPassword} placeholder="Confirm Password" required />

        <button type="submit">Sign Up</button>

        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}
        {#if successMessage}
            <p class="success">{successMessage}</p>
        {/if}
    </form>

    <p>Already have an account? <a href="/login">Login here</a></p>
</div>
