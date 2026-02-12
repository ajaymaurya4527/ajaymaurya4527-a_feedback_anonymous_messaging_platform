"use client"
import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Loader2, LogOut, UserCircle, Mail, Lock, AlertCircle, User, AtSign } from "lucide-react"

function Page() {
    const { data: session, status } = useSession()
    
    // UI State
    const [mode, setMode] = useState<"signin" | "signup">("signin")
    
    // Form State
    const [identifier, setIdentifier] = useState("") // Can be Email OR Username
    const [email, setEmail] = useState("")           // Used only for Registration
    const [username, setUsername] = useState("")     // Used only for Registration
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setError("")

        if (mode === "signin") {
            const res = await signIn("credentials", {
                loginIdentifier: identifier, // Pass the combined field
                password,
                redirect: false,
                callbackUrl: "/dashboard"
            })

            if (res?.error) {
                setError("Invalid credentials. Check your email/username or password.")
                setIsPending(false)
            } else {
                window.location.href = res?.url || "/dashboard"
            }
        } else {
            // REGISTER LOGIC
            try {
                const response = await fetch("/api/register", {
                    method: "POST",
                    body: JSON.stringify({ email, username, password }),
                    headers: { "Content-Type": "application/json" }
                })

                if (response.ok) {
                    // After signup, we log them in using the email as identifier
                    await signIn("credentials", { loginIdentifier: email, password, callbackUrl: "/dashboard" })
                } else {
                    const data = await response.json()
                    setError(data.message || "Registration failed")
                }
            } catch (err) {
                setError("Something went wrong. Please try again.")
            } finally {
                setIsPending(false)
            }
        }
    }

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center border border-gray-100">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 mb-6">
                        <UserCircle className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="text-gray-500 mt-2">{session.user?.email || session.user?.name}</p>
                    <button 
                        onClick={() => signOut()}
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-white hover:bg-gray-800 transition font-medium"
                    >
                        <LogOut className="h-4 w-4" /> Sign out
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {mode === "signin" ? "Sign in" : "Create account"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* --- SIGN IN FIELDS --- */}
                    {mode === "signin" ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email or Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input 
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    placeholder="email@example.com or username"
                                />
                            </div>
                        </div>
                    ) : (
                        /* --- SIGN UP FIELDS --- */
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        placeholder="johndoe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isPending}
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition-all disabled:opacity-70 shadow-lg mt-2"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === "signin" ? "Sign in" : "Get started")}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => {
                            setMode(mode === "signin" ? "signup" : "signin")
                            setError("")
                        }}
                        className="text-sm text-gray-600 hover:text-indigo-600 transition font-medium"
                    >
                        {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Page