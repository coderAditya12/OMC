"use client";

/**
 * Stats Grid Component
 * Displays key statistics in a grid layout with new design system
 */

import { motion } from "framer-motion";

interface Stat {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    gradient: string;
}

interface StatsGridProps {
    stats: Stat[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="glass-card p-5 text-center hover:border-[hsl(191,91%,37%,0.3)] transition-all"
                >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                        {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-[var(--foreground-muted)] text-sm">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
}
