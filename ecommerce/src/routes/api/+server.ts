import { json } from '@sveltejs/kit';

console.log("📌 API Root Route Loaded: /api");

export async function GET() {
    console.log("📌 GET request received at /api");
    return json({ message: "API root is available" });
}
