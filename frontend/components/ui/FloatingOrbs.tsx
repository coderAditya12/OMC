"use client";

/**
 * Floating Orbs Component
 * Creates animated floating gradient orbs with new color scheme
 */

import { motion } from "framer-motion";

export default function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large center orb - Primary cyan */}
            <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, hsl(191 91% 37% / 0.15) 0%, transparent 70%)"
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

            {/* Top right orb - Accent blue */}
            <motion.div
                className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
                style={{
                    background: "radial-gradient(circle, hsl(217 91% 60% / 0.2) 0%, transparent 70%)"
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

            {/* Bottom left orb - Primary light */}
            <motion.div
                className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full"
                style={{
                    background: "radial-gradient(circle, hsl(191 91% 45% / 0.2) 0%, transparent 70%)"
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

            {/* Additional accent orb */}
            <motion.div
                className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full"
                style={{
                    background: "radial-gradient(circle, hsl(217 91% 60% / 0.1) 0%, transparent 70%)"
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px"
                }}
            />
        </div>
    );
}
