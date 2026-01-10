"use client";

/**
 * Footer Component
 * Simple footer with branding
 */

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="border-t border-white/10 py-12 mt-20"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-sm">🧭</span>
                        </div>
                        <span className="text-white font-semibold">
                            OpenSource Compass
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-8 text-sm">
                        <Link href="https://github.com" className="text-white/50 hover:text-white transition-colors">
                            GitHub
                        </Link>
                        <Link href="#features" className="text-white/50 hover:text-white transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-white/50 hover:text-white transition-colors">
                            How It Works
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-white/40 text-sm">
                        © 2026 OpenSource Compass. Made with ❤️
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}
