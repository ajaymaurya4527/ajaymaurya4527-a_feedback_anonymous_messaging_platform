import { resend } from "@/src/lib/resend";
import VerificationEmail from "@/emails/verificationEmail";
import { ApiResponse } from "../types/apiResponse";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Email verification code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        // --- ADD THIS CHECK ---
        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, message: "Resend failed to send email" };
        }
        // ----------------------

        return { success: true, message: "Verification email sent successfully" };
    } catch (emailError) {
        console.error("Error sending verification email", emailError);
        return { success: false, message: "Failed to send verification email" };
    }
}



