import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

// 1. Change the type to Promise<{ messageid: string }>
export async function DELETE(
    request: Request, 
    { params }: { params: Promise<{ messageid: string }> } 
) {
    // 2. Await the params object
    const { messageid } = await params; 
    
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            sucess: false,
            message: "Not Authenticated"
        }, { status: 401 });
    }

    try {
        // Use messageid (from the awaited params)
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageid } } }
        );

        if (updatedResult.modifiedCount === 0) {
            return Response.json({
                sucess: false,
                message: "Message not found or already deleted"
            }, { status: 404 });
        }

        return Response.json({
            sucess: true,
            message: "Message Deleted"
        }, { status: 200 });

    } catch (error) {
        console.error("Error in delete route:", error);
        return Response.json({
            sucess: false,
            message: "Something went wrong"
        }, { status: 500 });
    }
}