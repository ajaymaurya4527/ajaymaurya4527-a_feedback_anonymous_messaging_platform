import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    // 1. Connection Pooling check to save resources on Vercel serverless functions
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    // 2. Explicitly safeguard against missing environment variables
    if (!process.env.MONGODB_URI) {
        console.error("Error: MONGODB_URI environment variable is missing.");
        process.exit(1);
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);

        // 3. Track connection state (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB connection failed", error);
        
        // Gracefully exit serverless function error block
        process.exit(1);
    }
}

export default dbConnect;