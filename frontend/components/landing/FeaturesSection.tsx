"use client";

/**
 * Features Section Component
 * Displays the main features with animated cards
 */

import { motion } from "framer-motion";
import FeatureCard from "@/components/ui/FeatureCard";

// Icons as React components
const ProfileIcon = () => (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const MatchIcon = () => (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const AIIcon = () => (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export default function FeaturesSection() {
    const features = [
        {
            icon: <ProfileIcon />,
            title: "Smart Profile Analysis",
            description: "We analyze your GitHub repos to understand your skills, languages, and experience level."
        },
        {
            icon: <MatchIcon />,
            title: "Perfect Issue Matching",
            description: "Our algorithm matches you with 'good first issues' that fit your skill level and interests."
        },
        {
            icon: <AIIcon />,
            title: "AI-Powered Guidance",
            description: "Chat with our AI assistant to understand issues, explore code, and get contribution tips."
        }
    ];

    return (
        <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Everything You Need to
                    <span className="text-emerald-400"> Start Contributing</span>
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                    From finding the right issue to making your first pull request,
                    we&apos;ve got you covered.
                </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        delay={index * 0.1}
                    />
                ))}
            </div>
        </section>
    );
}
