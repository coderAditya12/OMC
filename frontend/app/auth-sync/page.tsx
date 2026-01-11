"use client";

/**
 * Auth Sync Page
 * 
 * Beautiful loading page shown while syncing user auth with backend
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

export default function AuthSyncPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const processed = useRef(false);

    useEffect(() => {
        const syncWithBackend = async () => {
            if (status === "authenticated" && session && !processed.current) {
                processed.current = true;

                try {
                    // Send auth data to FastAPI backend
                    await axios.post("http://localhost:8000/auth/github", {
                        id: session.user?.id || "",
                        name: session.user?.name,
                        email: session.user?.email,
                        image: session.user?.image,
                        accessToken: session.accessToken,
                    }, { withCredentials: true });

                    console.log("Auth sync successful");
                } catch (error) {
                    console.error("Error syncing auth:", error);
                } finally {
                    // Always redirect to home after sync attempt
                    router.replace("/home");
                }
            } else if (status === "unauthenticated") {
                router.replace("/login");
            }
        };

        syncWithBackend();
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Background */}
            <FloatingOrbs />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                    >
                        <span className="text-4xl">🧭</span>
                    </motion.div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex items-center gap-3">
                        {/* Spinner */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                        />
                        <span className="text-white font-medium text-lg">Setting up your workspace...</span>
                    </div>

                    {/* Status Steps */}
                    <div className="flex flex-col gap-2 mt-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 text-white/60 text-sm"
                        >
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Connected to GitHub
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center gap-2 text-white/60 text-sm"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="w-4 h-4 rounded-full bg-emerald-500/50 flex items-center justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            </motion.div>
                            Syncing your profile
                        </motion.div>
                    </div>
                </motion.div>

                {/* Branding */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-white/30 text-sm"
                >
                    OpenSource Compass
                </motion.p>
            </div>
        </div>
    );
}
