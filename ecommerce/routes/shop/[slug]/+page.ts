import type { PageLoad } from './$types';

type Product = {
    name: string;
    description: string;
    image: string;
    price: string;
};

export const load: PageLoad = async ({ params, fetch }): Promise<{ product?: Product }> => {
    const slug = params.slug;

    const response = await fetch(`/api/products`);
    const products: Product[] = await response.json();

    function slugify(str: string): string {
        return str
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const product = products.find((p) => slugify(p.name) === slug);

    return product ? { product } : {};
};
