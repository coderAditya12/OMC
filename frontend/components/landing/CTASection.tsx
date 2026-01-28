"use client";

/**
 * CTA Section
 * Final call-to-action before footer with glassmorphism
 */

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-24 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden glass-card p-12 md:p-16 text-center"
            >
                {/* Background glow effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(191,91%,37%,0.1)] to-transparent pointer-events-none" />

                {/* Animated circles */}
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[hsl(191,91%,37%,0.15)] blur-3xl pointer-events-none"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[hsl(217,91%,60%,0.15)] blur-3xl pointer-events-none"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />

                {/* Content */}
                <div className="relative">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-6"
                    >
                        Ready to Start Your
                        <span className="block gradient-text">Open Source Journey?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-[var(--foreground-muted)] text-lg max-w-xl mx-auto mb-10"
                    >
                        Join thousands of developers who are making their mark in open source.
                        It&apos;s free to get started!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
                            Get Started for Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
