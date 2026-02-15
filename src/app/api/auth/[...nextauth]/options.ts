import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user.model";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [{ email: credentials.identifer }, { username: credentials.identifer }]
                    })

                    if (!user) { throw new Error("No user found with this email") }
                    if (!user.isVerified) { throw new Error("Please verify your account before login") }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Inccorect password")
                    }


                } catch (error: any) {
                    throw new Error(error)    //must with this
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString(); // Convert ObjectId to string
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        }
    },
    pages: {
        signIn: "/sign-in"//overwrite route
    },
    session: {
        strategy: "jwt",
        // How long (in seconds) until the session expires
        maxAge: 36 * 60 * 60, // 36 hours
    },
    secret: process.env.AUTH_SECRET
}