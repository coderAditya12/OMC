"use client";

/**
 * Login Page - OpenSource Compass
 * Centered glass card with access info section
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[hsl(191,91%,37%)] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
            {/* Background Effects */}
            <FloatingOrbs />

            {/* Centered Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Glass Card */}
                <div className="glass-card p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex flex-col items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 45, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center shadow-lg shadow-[hsl(191,91%,37%,0.3)]"
                            >
                                <span className="text-white text-3xl">🧭</span>
                            </motion.div>
                            <span className="text-white font-bold text-2xl">
                                OpenSource<span className="gradient-text">Compass</span>
                            </span>
                        </Link>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-[var(--foreground-muted)]">Sign in to continue your journey</p>
                    </div>

                    {/* GitHub Sign In Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => signIn("github", { callbackUrl: "/auth-sync" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 font-semibold rounded-xl transition-all hover:bg-white/90 shadow-lg mb-8"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Continue with GitHub
                    </motion.button>

                    {/* What We Access Section */}
                    <div className="space-y-4">
                        <p className="text-xs text-[var(--foreground-subtle)] uppercase tracking-wider text-center mb-4">
                            What we access
                        </p>

                        {/* Access Items */}
                        <div className="space-y-3">
                            {/* Public Profile */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(0,0%,100%,0.03)] border border-[var(--border)]">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(191,91%,37%,0.15)] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[hsl(191,91%,50%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Public Profile</p>
                                    <p className="text-[var(--foreground-subtle)] text-xs">Your name, email, and avatar</p>
                                </div>
                            </div>

                            {/* Public Repos */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(0,0%,100%,0.03)] border border-[var(--border)]">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(217,91%,60%,0.15)] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[hsl(217,91%,65%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Public Repositories</p>
                                    <p className="text-[var(--foreground-subtle)] text-xs">Languages and contribution history</p>
                                </div>
                            </div>

                            {/* No Private Access */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(142,71%,45%,0.05)] border border-[hsl(142,71%,45%,0.2)]">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(142,71%,45%,0.15)] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[hsl(142,71%,55%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[hsl(142,71%,55%)] text-sm font-medium">No Private Access</p>
                                    <p className="text-[var(--foreground-subtle)] text-xs">We never access private repos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 pt-6 border-t border-[var(--border)]">
                        <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-subtle)]">
                            <Link href="#" className="hover:text-[var(--foreground-muted)] transition-colors">
                                Terms
                            </Link>
                            <span>•</span>
                            <Link href="#" className="hover:text-[var(--foreground-muted)] transition-colors">
                                Privacy
                            </Link>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[hsl(142,71%,55%)]">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Secure OAuth
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-[var(--foreground-muted)] hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
