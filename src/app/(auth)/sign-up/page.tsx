"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react"
import axios from "axios"
import { signUpSchema } from "@/src/schemas/signUpSchema"
import toast, { Toaster } from "react-hot-toast" // 1. Import Toast

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

function SignUpPage() {
    const router = useRouter()
    
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isPending, setIsPending] = useState(false)
    
    const [usernameMessage, setUsernameMessage] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)

    const debouncedUsername = useDebounce(username, 500)

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (debouncedUsername.length >= 2) {
                setIsCheckingUsername(true)
                setUsernameMessage("")
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
                    setUsernameMessage(response.data.message)
                } catch (err: any) {
                    setUsernameMessage(err.response?.data?.message || "Error checking username")
                } finally {
                    setIsCheckingUsername(false)
                }
            } else {
                setUsernameMessage("")
            }
        }
        checkUsernameUnique()
    }, [debouncedUsername])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        const result = signUpSchema.safeParse({ username, email, password });

        if (!result.success) {
            const errorMessage = result.error.issues[0].message;
            toast.error(errorMessage); // 2. Toast for validation errors
            setIsPending(false);
            return;
        }

        try {
            const response = await axios.post("/api/sign-up", {
                email,
                username,
                password
            })

            if (response.data.success) {
                toast.success("Account created! Redirecting...") // 3. Toast for success
                router.push(`/dashboard`)//router.push(`/verify/${username}`) if we use to verify user ny resend email otp
            }
        } catch (err: any) {
            const axiosError = err.response?.data?.message || "Registration failed"
            toast.error(axiosError) // 4. Toast for API errors
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            {/* 5. Add the Toaster component here */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
                <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-900">Create account</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-xl border py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Username"
                        />
                        <div className="absolute right-3 top-3">
                            {isCheckingUsername && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                            {!isCheckingUsername && usernameMessage === "Username is unique" && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        {usernameMessage && !isCheckingUsername && (
                            <p className={`text-[11px] mt-1 ml-2 font-medium ${usernameMessage === "Username is available" ? "text-green-600" : "text-red-500"}`}>
                                {usernameMessage}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border py-2.5 pl-10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Email Address"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border py-2.5 pl-10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Password"
                        />
                    </div>

                    <button 
                        disabled={isPending || isCheckingUsername}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg disabled:opacity-70 transition active:scale-[0.98]"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get started"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => router.push('/sign-in')} 
                        className="text-sm hover:cursor-pointer text-indigo-600 font-medium hover:underline"
                    >
                        Already have an account? Log in
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignUpPage