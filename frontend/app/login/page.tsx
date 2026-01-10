"use client";

/**
 * Login Page - OpenSource Compass
 * 
 * Beautiful login page with animations and GitHub OAuth
 */

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (session) {
            router.push("/home");
        }
    }, [session, router]);

    // Loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-950 overflow-hidden">
            {/* Background Effects */}
            <FloatingOrbs />

            {/* Left Side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between">
                <div className="relative z-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <span className="text-white text-xl">🧭</span>
                        </div>
                        <span className="text-white font-bold text-2xl">
                            OpenSource<span className="text-emerald-400">Compass</span>
                        </span>
                    </Link>
                </div>

                {/* Center Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10"
                >
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Start Your
                        <span className="block text-emerald-400">Open Source Journey</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-md">
                        Connect your GitHub account and let our AI find the perfect issues for your first contribution.
                    </p>

                    {/* Feature List */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-white/70">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>Profile analysis in seconds</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>Personalized issue recommendations</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>AI-powered contribution guidance</span>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom */}
                <div className="relative z-10">
                    <p className="text-white/40 text-sm">
                        Trusted by 500+ developers worldwide
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <span className="text-white text-xl">🧭</span>
                            </div>
                            <span className="text-white font-bold text-xl">
                                OpenSource<span className="text-emerald-400">Compass</span>
                            </span>
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
                            <p className="text-white/60">Sign in to continue your journey</p>
                        </div>

                        {/* GitHub Sign In Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn("github", { callbackUrl: "/auth-sync" })}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 font-semibold rounded-xl transition-all hover:bg-white/90 shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </motion.button>

                        {/* Divider */}
                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 text-white/40 text-sm bg-slate-950/50">
                                    Secure OAuth authentication
                                </span>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Your data stays private and secure</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Instant access, no signup needed</span>
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="text-center text-white/40 text-xs mt-6">
                            By continuing, you agree to our{" "}
                            <Link href="#" className="text-emerald-400 hover:underline">Terms</Link>
                            {" "}and{" "}
                            <Link href="#" className="text-emerald-400 hover:underline">Privacy Policy</Link>
                        </p>
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-6">
                        <Link
                            href="/"
                            className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
