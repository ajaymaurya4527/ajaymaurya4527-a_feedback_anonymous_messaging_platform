import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    // 1. Check if session exists
    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    // 2. Convert string ID to MongoDB ObjectId
    // Ensure your next-auth session actually provides _id
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const userWithMessages = await UserModel.aggregate([
            { $match: { _id: userId } }, // FIX: Change 'id' to '_id'
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ]);

        if (!userWithMessages || userWithMessages.length === 0) {
            // If the user exists but has ZERO messages, aggregate might return empty
            // It's safer to return an empty array rather than a 404 error 
            // unless the user literally doesn't exist in the DB.
            return Response.json(
                { success: true, messages: [] }, 
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: userWithMessages[0].messages
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}