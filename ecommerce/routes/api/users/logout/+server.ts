import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // ✅ Clear JWT Cookie
        cookies.delete("authToken", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return new Response(JSON.stringify({ message: "Logged out successfully" }), { status: 200 });

    } catch (error) {
        console.error("Logout Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
