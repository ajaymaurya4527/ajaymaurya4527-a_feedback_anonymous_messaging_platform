import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            sucess: false,
            message: "Not Authenticated"
        }, { status: 401 })

    }
    try {
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        )
        if (updatedResult.modifiedCount == 0) {
            return Response.json({
                sucess: false,
                message: "Message not found or already deleted"
            }, { status: 404 })
        }

        return Response.json({
            sucess: true,
            message: "Message Deleted"
        }, { status: 200 })

    } catch (error) {
        console.log("something went wrong while deleting message:", error)
        return Response.json({
            sucess: false,
            message: "Something went wrong while deleting message"
        }, { status: 500 })


    }


}