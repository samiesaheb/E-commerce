import { writable, derived } from "svelte/store";

// ✅ Ensure this only runs in the browser
const isBrowser = typeof window !== "undefined";

// ✅ Authentication token store (Uses cookies, not localStorage)
export const authToken = writable<string | null>(null);

// ✅ User store
export const user = writable<{ email?: string; id?: string } | null>(null);

// ✅ Derived store for checking authentication status
export const isAuthenticated = derived(authToken, ($authToken) => !!$authToken);

// ✅ Function to set auth token (Now Accepts `null`)
export function setAuthToken(token: string | null) {
    authToken.set(token);
}

// ✅ Function to set user details
export function setUser(userData: { email?: string; id?: string } | null) {
    user.set(userData);
}


// ✅ Function to fetch user session (from cookies)
export async function fetchUserSession() {
    try {
        const response = await fetch("/api/users/session", {
            method: "GET",
            credentials: "include", // ✅ Ensure cookies are sent
        });

        const data = await response.json();
        if (response.ok) {
            setAuthToken("session"); // ✅ Mark user as logged in
            setUser({ email: data.email, id: data.id });
        } else {
            setAuthToken(null); // ✅ Allow null
            setUser(null);
        }
    } catch (error) {
        console.error("❌ Error fetching session:", error);
        setAuthToken(null); // ✅ Allow null
        setUser(null);
    }
}

// ✅ Function to log out user
export function logoutUser() {
    fetch("/api/users/logout", { method: "POST", credentials: "include" }) // ✅ Logout request to backend
        .then(() => {
            setAuthToken(null); // ✅ Allow null
            setUser(null);
        })
        .catch((error) => console.error("❌ Logout Error:", error));
}
