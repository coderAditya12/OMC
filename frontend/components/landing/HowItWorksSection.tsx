"use client";

/**
 * How It Works Section
 * Step-by-step guide with better icons and visuals
 */

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Connect GitHub",
        description: "Sign in with your GitHub account. We'll analyze your repos to understand your skills and experience level.",
        gradient: "from-violet-500 to-purple-600",
        svg: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
        )
    },
    {
        number: "02",
        title: "Get Matched",
        description: "Our smart algorithm finds 'good first issues' that perfectly match your programming languages and skill level.",
        gradient: "from-emerald-500 to-cyan-500",
        svg: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        number: "03",
        title: "Chat with AI",
        description: "Our AI assistant explains the issue, shows you the codebase structure, and guides you through the contribution process.",
        gradient: "from-amber-500 to-orange-500",
        svg: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )
    },
    {
        number: "04",
        title: "Make Your PR",
        description: "Submit your contribution with confidence! Join thousands of developers who started their open source journey here.",
        gradient: "from-pink-500 to-rose-500",
        svg: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    }
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                    Simple Process
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                    How It Works
                </h2>
                <p className="text-white/60 max-w-xl mx-auto text-lg">
                    Four simple steps to start your open source journey
                </p>
            </motion.div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative group"
                    >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all duration-300 h-full">
                            {/* Step Number Badge */}
                            <div className="absolute -top-4 left-8">
                                <span className={`px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r ${step.gradient} rounded-full shadow-lg`}>
                                    STEP {step.number}
                                </span>
                            </div>

                            <div className="flex items-start gap-6 mt-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                    {step.svg}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/60 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
