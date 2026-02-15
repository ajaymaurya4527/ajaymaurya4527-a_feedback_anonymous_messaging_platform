import { Message } from "@/src/model/user.model";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";

export async function POST(request:Request){
    await dbConnect();
    
    const {username,content}=await request.json();

    try {
        const user=await UserModel.findOne({username})
        if(!user){
            return Response.json(
                {
                    success:false,
                    message:"user not found"
                },{status:404}
            )
        }

        //is user acepting message or not

        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success:false,
                    message:"User is not accepting the message"
                },{status:403}
            )

        }

        const newMessage={content,createdAt:new Date()}

        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
                {
                    success:true,
                    message:"Message sent successfully"
                },{status:200}
            )
        
    } catch (error) {
        console.log("Something went wrong while sending message:",error)
        return Response.json(
                {
                    success:false,
                    message:"Something went wrong while sending message"
                },{status:500}
            )
        
    }
}
