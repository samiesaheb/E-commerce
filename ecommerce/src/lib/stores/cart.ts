import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

const CART_STORAGE_KEY = 'sveltekit_cart';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

// Load cart from localStorage if available
const loadCart = (): CartItem[] => {
    if (!browser) return []; // Ensure this only runs in the browser
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
};

// Initialize the cart with loaded data
export const cart = writable<CartItem[]>(loadCart());

// Persist cart to localStorage whenever it updates
cart.subscribe((items) => {
    if (browser) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
});

// Helper functions

/**
 * Adds a product to the cart or increments its quantity if it already exists.
 * @param product The product to add (without quantity, which defaults to 1)
 */
export const addToCart = (product: Omit<CartItem, 'quantity'>): void => {
    cart.update((items) => {
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
            return items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            return [...items, { ...product, quantity: 1 }];
        }
    });
};

/**
 * Removes a product from the cart by its ID.
 * @param id The ID of the product to remove
 */
export const removeFromCart = (id: string): void => {
    cart.update((items) => items.filter((item) => item.id !== id));
};

/**
 * Updates the quantity of a specific item in the cart.
 * If the new quantity is 0 or less, the item is removed.
 * @param id The ID of the product to update
 * @param newQuantity The new quantity (must be positive)
 */
export const updateCartQuantity = (id: string, newQuantity: number): void => {
    cart.update((items) => {
        if (newQuantity <= 0) {
            // Remove the item if quantity is 0 or less
            return items.filter((item) => item.id !== id);
        }

        // Update the quantity of the existing item
        return items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
    });
};

/**
 * Clears all items from the cart.
 */
export const clearCart = (): void => {
    cart.set([]);
};

/**
 * Synchronizes the cart with the backend.
 * @returns A promise that resolves to true if successful, false otherwise
 */
export const syncCartWithBackend = async (): Promise<boolean> => {
    const currentCart = get(cart);
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentCart),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to sync cart with backend:', error);
        return false;
    }
};