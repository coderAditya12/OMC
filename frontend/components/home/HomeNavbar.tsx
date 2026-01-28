"use client";

/**
 * Home Navbar Component
 * Navigation bar with frosted glass effect
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
            className="fixed top-0 left-0 right-0 z-50 glass-navbar"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 45 }}
                        transition={{ duration: 0.3 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center shadow-lg shadow-[hsl(191,91%,37%,0.25)]"
                    >
                        <span className="text-white text-lg">🧭</span>
                    </motion.div>
                    <span className="text-white font-bold text-xl hidden sm:block">
                        OpenSource<span className="gradient-text">Compass</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                    <Link
                        href="/home"
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-white rounded-lg hover:bg-[hsl(0,0%,100%,0.05)] transition-all"
                    >
                        Recommended
                    </Link>
                    <Link
                        href="/explore"
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-white rounded-lg hover:bg-[hsl(0,0%,100%,0.05)] transition-all"
                    >
                        Explore
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-white rounded-lg hover:bg-[hsl(0,0%,100%,0.05)] transition-all"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/chat"
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-white rounded-lg hover:bg-[hsl(0,0%,100%,0.05)] transition-all"
                    >
                        Chat
                    </Link>
                </div>

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
                                className="rounded-full border-2 border-[hsl(191,91%,37%,0.5)] shadow-lg"
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
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-white border border-[var(--border)] rounded-xl hover:bg-[hsl(0,0%,100%,0.1)] transition-all flex items-center gap-2"
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
