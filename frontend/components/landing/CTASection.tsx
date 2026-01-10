"use client";

/**
 * CTA Section
 * Final call-to-action before footer
 */

import { motion } from "framer-motion";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function CTASection() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-24 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-12 md:p-16 text-center"
            >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />

                {/* Animated circles */}
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl"
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
                        <span className="block text-emerald-400">Open Source Journey?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-white/70 text-lg max-w-xl mx-auto mb-10"
                    >
                        Join thousands of developers who are making their mark in open source.
                        It&apos;s free to get started!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <AnimatedButton href="/login" size="lg">
                            Get Started for Free →
                        </AnimatedButton>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
