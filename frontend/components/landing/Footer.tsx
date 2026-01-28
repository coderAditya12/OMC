"use client";

/**
 * Footer Component
 * Multi-column footer with logo, description, and link columns
 */

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
    const footerLinks = {
        product: [
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Pricing", href: "#" },
            { label: "FAQ", href: "#" },
        ],
        resources: [
            { label: "Documentation", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Guides", href: "#" },
            { label: "API", href: "#" },
        ],
        company: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Press", href: "#" },
        ],
    };

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="border-t border-white/10 py-16 mt-20"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

                    {/* Logo & Description - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center">
                                <span className="text-white text-lg">🧭</span>
                            </div>
                            <span className="text-white font-bold text-xl">
                                OpenSource<span className="gradient-text">Compass</span>
                            </span>
                        </Link>

                        {/* Description */}
                        <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
                            Helping developers find their path in the open source world through AI-powered matching and guidance.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            {/* Twitter/X */}
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[hsl(191,91%,37%,0.5)] transition-all"
                            >
                                <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>

                            {/* GitHub */}
                            <a
                                href="https://github.com/coderAditya12"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-emerald-500/50 transition-all"
                            >
                                <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/in/aditya-gupta-402ba4290/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-emerald-500/50 transition-all"
                            >
                                <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-[hsl(191,91%,50%)] transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-emerald-400 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 hover:text-emerald-400 transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/40 text-sm">
                        © 2026 OpenSource Compass. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="#" className="text-white/40 hover:text-white/70 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-white/40 hover:text-white/70 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
