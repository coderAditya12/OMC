"use client";

/**
 * Features Section Component
 * 9-card grid with glassmorphism styling
 */

import { motion } from "framer-motion";

const features = [
    {
        icon: "👤",
        title: "Smart Profile Analysis",
        description: "We analyze your GitHub repos to understand your skills and experience level."
    },
    {
        icon: "🎯",
        title: "Perfect Issue Matching",
        description: "Our algorithm matches you with 'good first issues' that fit your skill level."
    },
    {
        icon: "🤖",
        title: "AI-Powered Guidance",
        description: "Chat with our AI assistant to understand issues and get contribution tips."
    },
    {
        icon: "📊",
        title: "Skill Tracking",
        description: "Track your progress and see how your contributions grow over time."
    },
    {
        icon: "🔍",
        title: "Code Explorer",
        description: "Explore repository structure and understand codebases before contributing."
    },
    {
        icon: "📚",
        title: "README Integration",
        description: "AI reads and understands project documentation to help you get started."
    },
    {
        icon: "⚡",
        title: "Fast Matching",
        description: "Get personalized recommendations in seconds, not hours."
    },
    {
        icon: "🌐",
        title: "Multi-Language",
        description: "Support for 15+ programming languages across thousands of repositories."
    },
    {
        icon: "💬",
        title: "Chat History",
        description: "Keep track of all your conversations with the AI for future reference."
    }
];

export default function FeaturesSection() {
    return (
        <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <span className="text-[hsl(191,91%,50%)] text-sm font-semibold uppercase tracking-wider">
                    Features
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-4">
                    Everything You Need to
                    <span className="gradient-text"> Start Contributing</span>
                </h2>
                <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto text-lg">
                    From finding the right issue to making your first pull request,
                    we&apos;ve got you covered.
                </p>
            </motion.div>

            {/* 9-Card Feature Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="glass-card p-6 hover:border-[hsl(191,91%,37%,0.3)] transition-all duration-300 group"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%,0.2)] to-[hsl(217,91%,60%,0.2)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">{feature.icon}</span>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
