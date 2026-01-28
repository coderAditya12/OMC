"use client";

/**
 * Hero Section Component
 * Stunning hero with radial gradients, animated badge, and mock dashboard preview
 */

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Radial gradient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]"
                    style={{
                        background: "radial-gradient(ellipse at center, hsl(191 91% 37% / 0.15) 0%, transparent 60%)"
                    }}
                />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(191,91%,50%)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(191,91%,37%)]"></span>
                    </span>
                    <span className="text-sm gradient-text font-medium">
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
                        className="block gradient-text"
                    >
                        Open Source Journey
                    </motion.span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    We analyze your GitHub profile and match you with beginner-friendly issues.
                    Our AI assistant guides you through every contribution.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/login" className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Start with GitHub
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="#how-it-works" className="btn-secondary px-8 py-4 text-lg">
                            See How It Works
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    {[
                        { icon: "✨", text: "AI Matching" },
                        { icon: "📦", text: "235+ Repos" },
                        { icon: "💬", text: "Chat Assistant" },
                        { icon: "🚀", text: "24/7 AI Support" }
                    ].map((pill, i) => (
                        <span
                            key={i}
                            className="px-4 py-2 rounded-full glass text-sm text-[var(--foreground-muted)]"
                        >
                            {pill.icon} {pill.text}
                        </span>
                    ))}
                </motion.div>

                {/* Mock Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* macOS Window Frame */}
                    <div className="glass-card overflow-hidden">
                        {/* Window Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[hsl(0,0%,100%,0.02)]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[hsl(0,84%,60%)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(38,92%,50%)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(142,71%,45%)]" />
                            </div>
                            <div className="flex-1 text-center text-sm text-[var(--foreground-subtle)]">
                                OpenSource Compass - Dashboard
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-6 bg-gradient-to-b from-transparent to-[hsl(240,10%,6%,0.5)]">
                            {/* Sample Issue Cards */}
                            <div className="grid gap-4">
                                {[
                                    { title: "Fix TypeScript types in auth module", repo: "vercel/next.js", score: 92, lang: "TypeScript" },
                                    { title: "Add dark mode support to settings page", repo: "facebook/react", score: 88, lang: "JavaScript" },
                                    { title: "Update documentation for API endpoints", repo: "fastapi/fastapi", score: 85, lang: "Python" }
                                ].map((issue, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.2 + i * 0.1 }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(0,0%,100%,0.03)] border border-[var(--border)] hover:border-[hsl(191,91%,37%,0.3)] transition-colors"
                                    >
                                        {/* Score Badge */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex flex-col items-center justify-center">
                                            <span className="text-white font-bold text-sm">{issue.score}%</span>
                                        </div>
                                        {/* Issue Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium truncate">{issue.title}</div>
                                            <div className="text-[var(--foreground-subtle)] text-sm">{issue.repo}</div>
                                        </div>
                                        {/* Language Badge */}
                                        <span className="px-3 py-1 rounded-lg bg-[hsl(191,91%,37%,0.1)] border border-[hsl(191,91%,37%,0.2)] text-[hsl(191,91%,50%)] text-xs font-medium">
                                            {issue.lang}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Glow effect behind window */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(191,91%,37%,0.1)] to-[hsl(217,91%,60%,0.1)] rounded-3xl blur-2xl -z-10" />
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
                >
                    {[
                        { value: "235+", label: "Repositories" },
                        { value: "10K+", label: "Issues Indexed" },
                        { value: "15+", label: "Languages" },
                        { value: "24/7", label: "AI Assistant" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                            <div className="text-[var(--foreground-subtle)] text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
