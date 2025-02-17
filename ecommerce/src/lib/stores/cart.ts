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
    if (typeof window === 'undefined') return [];
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
};


export const cart = writable<CartItem[]>(loadCart());

// Persist cart to localStorage whenever it updates
cart.subscribe((items) => {
    if (browser) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
});

// Helper functions
export const addToCart = (product: CartItem, quantity: number = 1): void => {
    cart.update((items) => {
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            items.push({ ...product, quantity });
        }
        return structuredClone(items);
    });
};

export const removeFromCart = (id: string): void => {
    cart.update((items) => items.filter((item) => item.id !== id));
};

export const updateCartQuantity = (id: string, quantity: number): void => {
    cart.update((items) => {
        const item = items.find((i) => i.id === id);
        if (item) item.quantity = Math.max(1, quantity); // Prevent zero or negative values
        return structuredClone(items);
    });
};


export const clearCart = (): void => {
    cart.set([]);
};

export const syncCartWithBackend = async (): Promise<boolean> => {
    const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get(cart)),
    });
    return response.ok;
};
