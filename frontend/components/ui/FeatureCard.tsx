"use client";

/**
 * Feature Card Component
 * An animated card for displaying features
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    delay?: number;
}

export default function FeatureCard({
    icon,
    title,
    description,
    delay = 0
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-emerald-500/50"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />

            {/* Icon */}
            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            {/* Content */}
            <h3 className="relative text-xl font-semibold text-white mb-3">
                {title}
            </h3>
            <p className="relative text-white/60 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
