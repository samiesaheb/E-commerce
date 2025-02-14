import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'; // ✅ Correct import


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		files: {
			routes: 'src/routes' // ✅ Ensures SvelteKit finds the routes
		}
	}
};

export default config;
