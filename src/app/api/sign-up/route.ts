import dbConnect from "@/src/lib/dbConnect";// always need to connect every route with database because next.js run edge time
import UserModel from "@/src/model/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/src/helper/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {// always with this syntax
    await dbConnect();//connect to this with database every function of api calling
    try {
        const { username, email, password } = await request.json();//while creating a user account this field send by users
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

            }else{
                const hasedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password=hasedPassword;
                existingUserByEmail.verifyCode=verifyCode;
                existingUserByEmail.verifyCodeExpiry=new Date(Date.now() + 3600000)
                
                await existingUserByEmail.save();

            }
        } else {
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,//smaller s in ts
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            //send verification email
            await newUser.save()
        }
        const emailRespone = await sendVerificationEmail(username, email, verifyCode)

        if (!emailRespone.success) {
            return Response.json({
                success: false,
                message: emailRespone.message

            }, { status: 500 })
        }
        return Response.json({
            success: false,
            message: "User registered successfully .Please verify your email"

        }, { status: 500 })


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