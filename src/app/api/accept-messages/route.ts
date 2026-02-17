import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { User } from "next-auth";

export async function POST(request: Request) {//The POST function is responsible for changing the user's status in the database. in this code we make a route to toggle button og changig status of isAccepting message fields of user
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"

        }, { status: 401 })
    }
    const userId = user._id;

    const { acceptMessages } = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            isAcceptingMessage: acceptMessages
        }, {
            new: true//it's return updated values
        })
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update accepting messages"

            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: "Message acceptance status updated"

        }, { status: 201 })

    } catch (error) {
        console.log("failed to update user status to accept message")
        return Response.json({
            success: false,
            message: "failed to update user status to accept message"

        }, { status: 500 })
    }

}

export async function GET(request: Request) {//The GET function is responsible for retrieving the current status from the database of user isAccepting message status
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"

        }, { status: 401 })
    }
    
    try {
        const userId = user._id || user.id;
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found in database"

            }, { status: 404 })

        }
        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage

        }, { status: 200 })
    } catch (error) {
        console.log("Error is getting message acceptance status")
        return Response.json({
            success: false,
            isAcceptingMessages: "Error is getting message acceptance status"

        }, { status: 500 })

    }


}