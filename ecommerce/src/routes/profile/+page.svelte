<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { authToken, user, logoutUser } from "$lib/stores/auth";
    import { get } from "svelte/store";

    type UserData = {
        email?: string;
        id?: string;
        profilePicture?: string;
        firstName?: string;
        lastName?: string;
    };

    let userData: UserData = get(user) || {};
    let errorMessage = "";
    let loading = true;
    let profilePicture = "/default-avatar.png";

    async function fetchUserProfile() {
        try {
            const token = get(authToken);
            console.log("Fetching profile with token:", token);
            if (!token) {
                errorMessage = "No token available. Please log in.";
                goto("/login");
                return;
            }

            const response = await fetch("/api/users/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                user.set(data);
                userData = data;
                profilePicture = data.profilePicture || "/default-avatar.png";
                console.log("Profile fetched successfully:", data);
            } else {
                errorMessage = data.error || "Failed to load profile.";
                console.error("Profile fetch failed:", response.status, data);
                if (response.status === 401) {
                    errorMessage = "Session expired. Please log in again.";
                    goto("/login");
                }
            }
        } catch (error) {
            console.error("Profile Fetch Error:", error);
            errorMessage = "An error occurred while fetching profile data.";
        } finally {
            loading = false;
        }
    }

    async function uploadProfilePicture(event: Event) {
        const fileInput = event.target as HTMLInputElement;
        if (!fileInput.files || fileInput.files.length === 0) return;

        let token = get(authToken);
        if (!token) {
            errorMessage = "You must be logged in to upload a picture.";
            goto("/login");
            return;
        }

        console.log("Uploading with token:", token);

        const formData = new FormData();
        formData.append("profilePicture", fileInput.files[0]);

        try {
            const response = await fetch("/api/users/profile-picture", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log("Upload response:", data, "Status:", response.status);

            if (response.ok) {
                profilePicture = data.profilePicture;
                userData = { ...userData, profilePicture: data.profilePicture };
                user.set(userData);
                errorMessage = "";
                console.log("Profile picture uploaded successfully:", data.profilePicture);
            } else {
                errorMessage = data.error || "Failed to upload picture.";
                console.error("Upload failed:", response.status, data);
                if (response.status === 401) {
                    errorMessage = "Your session has expired. Please log in again to continue.";
                    // Stay on page, let user retry or log out manually
                }
            }
        } catch (error) {
            console.error("Profile Picture Upload Error:", error);
            errorMessage = "An error occurred while uploading. Please try again.";
        }
    }

    function logout() {
        logoutUser();
        goto("/login");
    }

    onMount(fetchUserProfile);
</script>

<div class="profile-page">
    <div class="profile-container">
        <div class="header">
            <h1>My Account</h1>
            <p>Manage your profile and orders</p>
        </div>

        {#if loading}
            <div class="loading">Loading your profile...</div>
        {:else if errorMessage}
            <p class="error">{errorMessage}</p>
            <button class="retry-btn" on:click={fetchUserProfile}>Retry</button>
        {:else if userData?.email}
            <div class="profile-content">
                <!-- Profile Picture Section -->
                <div class="profile-pic-section">
                    <img class="profile-pic" src={profilePicture} alt="Profile Picture" />
                    <label for="profile-upload" class="upload-btn">Change Picture</label>
                    <input 
                        id="profile-upload" 
                        type="file" 
                        accept="image/*" 
                        on:change={uploadProfilePicture} 
                        hidden 
                    />
                </div>

                <!-- Account Details -->
                <div class="account-details">
                    <h2>Account Information</h2>
                    <div class="detail-item">
                        <span class="label">Email:</span>
                        <span class="value">{userData.email}</span>
                    </div>
                    {#if userData.firstName || userData.lastName}
                        <div class="detail-item">
                            <span class="label">Name:</span>
                            <span class="value">{userData.firstName || ''} {userData.lastName || ''}</span>
                        </div>
                    {/if}
                    <button class="edit-btn">Edit Profile</button>
                </div>

                <!-- Order History Placeholder -->
                <div class="order-history">
                    <h2>Recent Orders</h2>
                    <p class="placeholder">No recent orders. Start shopping now!</p>
                    <a href="/shop" class="shop-link">Browse Products</a>
                </div>

                <!-- Logout -->
                <button class="logout-btn" on:click={logout}>Sign Out</button>
            </div>
        {:else}
            <p class="no-data">No profile information found.</p>
        {/if}
    </div>
</div>

<style>
    .profile-page {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 2rem;
    }

    .profile-container {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        width: 100%;
        max-width: 800px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin: 0;
    }

    .header p {
        color: #666;
        font-size: 1.1rem;
        margin-top: 0.5rem;
    }

    .loading {
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        padding: 2rem;
    }

    .error {
        color: #ff4444;
        font-size: 1rem;
        text-align: center;
        margin: 1rem 0;
    }

    .retry-btn {
        display: block;
        margin: 0 auto;
        padding: 0.75rem 1.5rem;
        background: #EF0107;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .retry-btn:hover {
        background: #ff8787;
    }

    .profile-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .profile-pic-section {
        text-align: center;
    }

    .profile-pic {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #ddd;
        margin-bottom: 1rem;
    }

    .upload-btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #EF0107;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s;
    }

    .upload-btn:hover {
        background: #ff8787;
    }

    .account-details {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
    }

    .account-details h2 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1rem;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }

    .label {
        font-weight: 500;
        color: #666;
    }

    .value {
        color: #333;
    }

    .edit-btn {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: #EF0107;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .edit-btn:hover {
        background: #EF0107;
    }

    .order-history {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
    }

    .order-history h2 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1rem;
    }

    .placeholder {
        color: #666;
        font-style: italic;
    }

    .shop-link {
        display: inline-block;
        margin-top: 1rem;
        color: #EF0107;
        text-decoration: none;
        font-weight: 500;
    }

    .shop-link:hover {
        text-decoration: underline;
    }

    .logout-btn {
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

    .logout-btn:hover {
        background: #cc3333;
    }

    .no-data {
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        padding: 2rem;
    }
</style>