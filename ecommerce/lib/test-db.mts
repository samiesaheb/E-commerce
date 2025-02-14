import { connectToDatabase } from './db.js'; // ✅ Ensure .js extension
import mongoose from 'mongoose';

async function testDatabase() {
    try {
        console.log("📌 Testing MongoDB connection...");
        await connectToDatabase();
        console.log("✅ MongoDB Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    } finally {
        await mongoose.connection.close();
    }
}

testDatabase();
