"use client";

/**
 * How It Works Section
 * Step-by-step guide with animated timeline
 */

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Connect GitHub",
        description: "Sign in with your GitHub account. We'll analyze your repos to understand your skills.",
        icon: "🔗"
    },
    {
        number: "02",
        title: "Get Matched",
        description: "Receive personalized recommendations for beginner-friendly issues that match your profile.",
        icon: "🎯"
    },
    {
        number: "03",
        title: "Ask the AI",
        description: "Chat with our AI assistant to understand the issue, explore the codebase, and get guidance.",
        icon: "🤖"
    },
    {
        number: "04",
        title: "Contribute",
        description: "Make your contribution with confidence and join the open source community!",
        icon: "🚀"
    }
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    How It <span className="text-emerald-400">Works</span>
                </h2>
                <p className="text-white/60 max-w-xl mx-auto">
                    Four simple steps to start your open source journey
                </p>
            </motion.div>

            {/* Steps */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-emerald-500/50 to-transparent z-0" />
                        )}

                        {/* Step Card */}
                        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                            {/* Step Number */}
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl">{step.icon}</span>
                                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                    STEP {step.number}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">
                                {step.title}
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
