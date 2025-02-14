<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { authToken, user, logoutUser } from "$lib/stores/auth";
    import { get } from "svelte/store";

    // ✅ Define expected user structure
    type UserData = {
        email?: string;
        id?: string;
        profilePicture?: string;
    };

    let userData: UserData = get(user) || {}; 
    let errorMessage = "";
    let loading = true;
    let profilePicture = "/default-avatar.png"; // ✅ Default profile picture

    async function fetchUserProfile() {
    try {
        const response = await fetch("/api/users/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // ✅ Ensures cookies (authToken) are sent
        });

        const data = await response.json();
        if (response.ok) {
            user.set(data);
            userData = data;
            profilePicture = data.profilePicture || "/default-avatar.png";
        } else {
            errorMessage = data.error || "Failed to load profile.";
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

        const formData = new FormData();
        formData.append("profilePicture", fileInput.files[0]);

        let token: string | null = get(authToken); // ✅ Get token

        try {
            const response = await fetch("/api/users/profile-picture", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                profilePicture = data.profilePicture;
                userData = { ...userData, profilePicture: data.profilePicture };
                user.set(userData); 
            } else {
                errorMessage = data.error || "Failed to upload picture.";
            }
        } catch (error) {
            console.error("Profile Picture Upload Error:", error);
            errorMessage = "An error occurred while uploading.";
        }
    }

    function logout() {
        logoutUser();
        goto("/login");
    }

    onMount(fetchUserProfile);
</script>

<style>
    .profile-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border-radius: 8px;
        background: #fff;
        color: black;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .profile-pic {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 10px;
    }
    .upload-btn {
        display: block;
        margin: 10px auto;
    }
    .logout-btn {
        background: red;
        color: white;
        padding: 10px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
        border-radius: 5px;
    }
    .logout-btn:hover {
        background: darkred;
    }
    .error {    
        color: red;
        font-weight: bold;
    }
</style>

<div class="profile-container">
    <h2>User Profile</h2>

    {#if loading}
        <p>Loading profile...</p>
    {:else if errorMessage}
        <p class="error">{errorMessage}</p>
    {:else if userData?.email}
        <img class="profile-pic" src={profilePicture} alt="Profile Picture" />

        <p><strong>Email:</strong> {userData.email}</p>

        <input class="upload-btn" type="file" accept="image/*" on:change={uploadProfilePicture} />

        <button class="logout-btn" on:click={logout}>Logout</button>
    {:else}
        <p>No profile information found.</p>
    {/if}
</div>
