import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

const CART_STORAGE_KEY = "sveltekit_cart";

// Define Cart Item Type with stock
export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    stock?: number; // Added stock property
}

// Load Cart from Local Storage
const loadCart = (): CartItem[] => {
    if (!browser) return [];
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
};

// Create Writable Cart Store
export const cart = writable<CartItem[]>(loadCart());

// Persist Cart to Local Storage & Sync with Backend
cart.subscribe((items) => {
    if (browser) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        syncCartWithBackend();
    }
});

// Function to sync cart with backend
export async function syncCartWithBackend() {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: get(cart) }),
    });

    return response.ok;
}

// Function to fetch cart from backend on login
export async function loadCartFromBackend() {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const items: CartItem[] = await response.json();
        cart.set(items);
    }
}

// Call this function when user logs in
export function handleLogin() {
    loadCartFromBackend();
}

// Function to Add Item to Cart with stock checking
export function addToCart(product: Omit<CartItem, "quantity">) {
    cart.update((items) => {
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
            // Check if adding one more exceeds stock
            if (existingItem.stock !== undefined && existingItem.quantity >= existingItem.stock) {
                console.warn(`Cannot add more ${product.name} - stock limit reached`);
                return items;
            }
            existingItem.quantity += 1;
        } else {
            items.push({ ...product, quantity: 1 });
        }
        return [...items];
    });
}

// Function to Update Quantity in Cart with stock validation
export function updateCartQuantity(id: string, quantity: number) {
    cart.update((items) => {
        const itemIndex = items.findIndex((i) => i.id === id);
        if (itemIndex === -1) return items;

        const item = items[itemIndex];
        // Validate against stock
        if (item.stock !== undefined && quantity > item.stock) {
            console.warn(`Cannot set quantity to ${quantity} - exceeds stock of ${item.stock}`);
            item.quantity = item.stock; // Set to max available
        } else if (quantity <= 0) {
            return items.filter((i) => i.id !== id); // Remove if 0 or negative
        } else {
            item.quantity = quantity;
        }
        return [...items];
    });
}

// Function to Remove Item from Cart
export function removeFromCart(id: string) {
    cart.update((items) => items.filter((item) => item.id !== id));
}

// Function to Clear Cart (After Checkout)
export async function clearCart() {
    cart.set([]);

    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    await fetch("/api/cart", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

// Optional: Function to validate cart against current stock
export function validateCartStock(products: { id: string; stock?: number }[]) {
    cart.update((items) => {
        return items.map(item => {
            const currentProduct = products.find(p => p.id === item.id);
            if (currentProduct && currentProduct.stock !== undefined && item.quantity > currentProduct.stock) {
                return { ...item, quantity: currentProduct.stock };
            }
            return item;
        }).filter(item => item.quantity > 0);
    });
}