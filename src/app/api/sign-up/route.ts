import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import bcrypt from "bcryptjs";
// import { sendVerificationEmail } from "@/src/helper/sendVerificationEmail"; // Commented out import

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true })
        
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already exists"
                }, { status: 400 }
            )
        }
        
        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        if (existingUserByEmail) {
            if(existingUserByEmail.isVerified){
                return Response.json({
                success: false,
                message: "User already exists with this email"
            }, { status: 400 })

            } else {
                const hasedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hasedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                
                await existingUserByEmail.save();
            }
        } else {
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: true, // User is verified by default now
                isAcceptingMessage: true,
                messages: [],
                collections: []//

            })
            
            await newUser.save()
        }

        /* // Commenting out the email verification logic
        const emailRespone = await sendVerificationEmail(username, email, verifyCode)

        if (!emailRespone.success) {
            return Response.json({
                success: false,
                message: emailRespone.message
            }, { status: 400 })
        } 
        */

        return Response.json({
            success: true,
            message: "User registered successfully." // Removed "Please verify your email" since we skipped the email
        }, { status: 200 })


    } catch (error) {
        console.log("Error registering user", error)
        return Response.json({
            success: false,
            message: "Error registering user"
        }, {
            status: 500
        })
    }
}