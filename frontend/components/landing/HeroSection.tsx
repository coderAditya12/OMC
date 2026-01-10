"use client";

/**
 * Hero Section Component
 * The main hero area with animated text and CTA
 */

import { motion } from "framer-motion";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto text-center relative z-10">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm text-emerald-400 font-medium">
                        AI-Powered Open Source Discovery
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                >
                    Find Your Perfect
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                    >
                        Open Source Match
                    </motion.span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    We analyze your GitHub profile and match you with beginner-friendly issues.
                    Our AI assistant guides you through every contribution.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <AnimatedButton href="/login" size="lg">
                        Start Contributing Today
                    </AnimatedButton>
                    <AnimatedButton href="#how-it-works" variant="secondary" size="lg">
                        See How It Works
                    </AnimatedButton>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-16 flex flex-wrap justify-center gap-12"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">1000+</div>
                        <div className="text-white/50 text-sm">Issues Matched</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">500+</div>
                        <div className="text-white/50 text-sm">Contributors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">50+</div>
                        <div className="text-white/50 text-sm">Languages</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
