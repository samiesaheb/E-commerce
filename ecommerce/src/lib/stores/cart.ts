import { writable } from "svelte/store";

export const cart = writable<{ name: string; price: string; image: string; quantity: number }[]>([]);
