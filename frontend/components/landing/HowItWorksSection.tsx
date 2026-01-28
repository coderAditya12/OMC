"use client";

/**
 * How It Works Section
 * Timeline layout with connected steps
 */

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Connect GitHub",
        description: "Sign in with your GitHub account. We'll analyze your repos to understand your skills and experience level.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        )
    },
    {
        number: "02",
        title: "Get Matched",
        description: "Our smart algorithm finds 'good first issues' that perfectly match your programming languages and skill level.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        number: "03",
        title: "Chat with AI",
        description: "Our AI assistant explains the issue, shows you the codebase structure, and guides you through the contribution process.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )
    },
    {
        number: "04",
        title: "Make Your PR",
        description: "Submit your contribution with confidence! Join thousands of developers who started their open source journey here.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    }
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <span className="text-[hsl(191,91%,50%)] text-sm font-semibold uppercase tracking-wider">
                    Simple Process
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                    How It Works
                </h2>
                <p className="text-[var(--foreground-muted)] max-w-xl mx-auto text-lg">
                    Four simple steps to start your open source journey
                </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(191,91%,37%)] via-[hsl(217,91%,60%)] to-[hsl(191,91%,37%)] hidden md:block" />

                {/* Steps */}
                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="relative flex gap-8 items-start"
                        >
                            {/* Step Number Circle */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center shadow-lg shadow-[hsl(191,91%,37%,0.3)] z-10"
                            >
                                {step.icon}
                            </motion.div>

                            {/* Content Card */}
                            <div className="flex-1 glass-card p-6 hover:border-[hsl(191,91%,37%,0.3)] transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[hsl(191,91%,50%)] text-sm font-bold">
                                        STEP {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-[var(--foreground-muted)] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
