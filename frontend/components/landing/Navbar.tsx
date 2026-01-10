"use client";

/**
 * Navbar Component
 * Fixed navigation with glass morphism effect
 */

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                    >
                        <span className="text-white font-bold text-lg">🧭</span>
                    </motion.div>
                    <span className="text-white font-bold text-xl tracking-tight">
                        OpenSource <span className="text-emerald-400">Compass</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-white/70 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors">
                        How it Works
                    </Link>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-white/80 hover:text-white transition-colors font-medium"
                    >
                        Sign In
                    </Link>
                    <AnimatedButton href="/login" size="sm">
                        Get Started →
                    </AnimatedButton>
                </div>
            </div>
        </motion.nav>
    );
}
