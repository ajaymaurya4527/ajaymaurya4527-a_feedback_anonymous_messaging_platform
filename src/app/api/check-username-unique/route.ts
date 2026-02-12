import dbConnect from '@/src/lib/dbConnect';
import UserModel from "@/src/model/user.model"
import { userNameValidation } from '@/src/schemas/signUpSchema';
import { z } from 'zod';

const userNameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(request: Request) {
    // if(request.method !== "GET"){
    //     return Response.json({
    //             success: false,
    //             message: "Only GET method is allowed" 
    //         }, { status: 405 })
    // }
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username'),
        };
        const result = userNameQuerySchema.safeParse(queryParams)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid query parameters',
            }, { status: 400 })
        }

        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Username is available',
            },
            { status: 200 }
        );




    } catch (error) {
        console.error('Error checking username:', error);
        return Response.json(
            {
                success: false,
                message: 'Error checking username',
            },
            { status: 500 }
        );
    }

}