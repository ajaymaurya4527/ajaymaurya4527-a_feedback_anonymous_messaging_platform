"use client"
import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, UserCircle, Lock, AtSign } from "lucide-react"
import { signInSchema } from "@/src/schemas/signInSchema"
import toast, { Toaster } from "react-hot-toast"

function SignInPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    const [identifier, setIdentifier] = useState("") 
    const [password, setPassword] = useState("")
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        // 1. Zod Validation
        const validation = signInSchema.safeParse({ identifier, password });

        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            setIsPending(false);
            return;
        }

        // 2. NextAuth Sign In logic
        // IMPORTANT: We use 'identifer' to match your backend authorize logic
        const res = await signIn("Credentials", {
            identifer: identifier, 
            password: password,
            redirect: false,
        })

        if (res?.error) {
            // This will catch the "No user found", "Incorrect password", or "Verify your account" 
            // errors thrown by your backend
            toast.error(res.error); 
            setIsPending(false)
        } else if (res?.url) {
            toast.success("Welcome back!");
            router.push("/dashboard")
        }
    }

    // Loading State
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
        )
    }

    // Already Logged In State
    if (session) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center border border-gray-100">
                    <UserCircle className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                    <h1 className="text-2xl font-bold">Logged in as {session.user?.username || "User"}</h1>
                    <p className="text-gray-500 mt-2">{session.user?.email}</p>
                    <button 
                        onClick={() => {
                            signOut();
                            toast.success("Signed out successfully");
                        }}
                        className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white hover:bg-gray-800 transition"
                    >
                        <LogOut className="h-4 w-4" /> Sign out
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Toaster position="top-center" />

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
                <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-900">Sign in</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full rounded-xl border py-2.5 pl-10 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-gray-200"
                            placeholder="Email or Username"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border py-2.5 pl-10 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-gray-200"
                            placeholder="Password"
                        />
                    </div>

                    <button 
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg disabled:opacity-70 transition active:scale-[0.98]"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => router.push('/sign-up')} 
                        className="text-sm cursor-pointer text-indigo-600 font-medium hover:underline"
                    >
                        Don't have an account? Sign up
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignInPage