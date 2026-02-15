import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"

        }, { status: 401 })
    }
    const userId = new mongoose.Types.ObjectId(user._id);//user._id if this is string or object it's return mongoose objext type

    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: "$messages" },//unwind remove the array ex,[{},{}]=>{},{}
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ])
        if (!user || user.length === 0) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );

    }
}