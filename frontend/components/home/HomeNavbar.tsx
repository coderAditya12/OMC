"use client";

/**
 * Home Navbar Component
 * Navigation bar for the home page with user profile
 */

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface HomeNavbarProps {
    userImage?: string | null;
    userName?: string | null;
}

export default function HomeNavbar({ userImage, userName }: HomeNavbarProps) {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-lg">🧭</span>
                    </div>
                    <span className="text-white font-bold text-xl hidden sm:block">
                        OpenSource<span className="text-emerald-400">Compass</span>
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        {userImage && (
                            <Image
                                src={userImage}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="rounded-full border-2 border-emerald-500/50 shadow-lg"
                            />
                        )}
                        <span className="text-white font-medium hidden md:block">
                            {userName?.split(" ")[0]}
                        </span>
                    </div>

                    {/* Sign Out Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline">Sign Out</span>
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}
