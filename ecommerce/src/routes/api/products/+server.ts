import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const products = [
        { 
            id: '1', // ✅ Added unique ID
            name: 'Product A', 
            description: 'Lorem ipsum dolor sit amet.', 
            image: '/images/product-a.jpg', 
            price: 10.00  // ✅ Changed to number
        },
        { 
            id: '2', 
            name: 'Product B', 
            description: 'Dolor sit amet consectetur adipiscing.', 
            image: '/images/product-b.jpg', 
            price: 15.00
        },
        { 
            id: '3', 
            name: 'Awesome Product', 
            description: 'Consectetur adipiscing elit.', 
            image: '/images/awesome-product.jpg', 
            price: 20.00
        }
    ];

    return new Response(JSON.stringify(products), {
        headers: { 'Content-Type': 'application/json' }
    });
};

