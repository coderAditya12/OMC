"use client";

/**
 * Navbar Component
 * Fixed navigation with frosted glass effect
 * Compass logo with hover rotation and glow
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 glass-navbar"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo with Glow Effect */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 45, scale: 1.1 }}
                            transition={{ duration: 0.3, type: "spring" }}
                            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-300" />
                            <span className="relative text-white font-bold text-lg">🧭</span>
                        </motion.div>
                        <span className="text-white font-bold text-xl tracking-tight">
                            OpenSource<span className="gradient-text">Compass</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="#features"
                            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                        >
                            How it Works
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="btn-ghost"
                        >
                            Sign In
                        </Link>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href="/login" className="btn-primary flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Continue with GitHub
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden relative w-10 h-10 flex items-center justify-center"
                    >
                        <div className="flex flex-col gap-1.5">
                            <motion.span
                                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-white block"
                            />
                            <motion.span
                                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-6 h-0.5 bg-white block"
                            />
                            <motion.span
                                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-white block"
                            />
                        </div>
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-[72px] left-0 right-0 z-40 glass-navbar p-6 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            <Link
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2 transition-colors"
                            >
                                Features
                            </Link>
                            <Link
                                href="#how-it-works"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2 transition-colors"
                            >
                                How it Works
                            </Link>
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <hr className="border-[var(--border)]" />
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="btn-primary text-center"
                            >
                                Continue with GitHub
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
