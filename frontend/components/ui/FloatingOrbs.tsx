"use client";

/**
 * Floating Orbs Component
 * Creates animated floating gradient orbs for background effect
 */

import { motion } from "framer-motion";

export default function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large center orb */}
            <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)"
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Top right orb - Cyan */}
            <motion.div
                className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)"
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Bottom left orb - Emerald */}
            <motion.div
                className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)"
                }}
                animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px"
                }}
            />
        </div>
    );
}
