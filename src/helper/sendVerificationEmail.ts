import { resend } from "@/src/lib/resend";
import VerificationEmail from "@/emails/verificationEmail";
import { ApiResponse } from "../types/apiResponse";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {

        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Email verification code',
            react:VerificationEmail({username,otp:verifyCode}),
        });

        return { success: true, message: "verification email send successfully" }
    } catch (emailError) {
        console.log("Error sending verification email", emailError)
        return { success: false, message: "failed to send verification email" }

    }

}



