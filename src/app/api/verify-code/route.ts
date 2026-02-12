import dbConnect from '@/src/lib/dbConnect';
import UserModel from "@/src/model/user.model";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json()

        const decodedUsername = decodeURIComponent(username)//it's not required but used for me better implementation
        const user = await UserModel.findOne({
            username: decodedUsername
        })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'user not found',
                },
                { status: 400 }
            );

        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeNotExpired && isCodeValid) {
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: 'Account verified successfully',
                },
                { status: 201 }
            );
        }else if(!isCodeNotExpired){
            return Response.json(
            {
                success: false,
                message: 'verification code expired ,please sign up again to get new code',
            },
            { status: 400 }
        );

        }else{
            return Response.json(
            {
                success: false,
                message: 'Incorrect verification code ',
            },
            { status: 400 }
        );

        }


    } catch (error) {
        console.error('Error verifing user:', error);
        return Response.json(
            {
                success: false,
                message: 'Error verifing user',
            },
            { status: 500 }
        );
    }
}