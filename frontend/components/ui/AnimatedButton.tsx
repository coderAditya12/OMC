"use client";

/**
 * Animated Button Component
 * A beautiful button with hover animations and gradient effects
 */

import { motion } from "framer-motion";
import Link from "next/link";

interface AnimatedButtonProps {
    href: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
}

export default function AnimatedButton({
    href,
    children,
    variant = "primary",
    size = "md"
}: AnimatedButtonProps) {
    // Size classes
    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    // Variant classes
    const variantClasses = {
        primary: "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25",
        secondary: "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Link
                href={href}
                className={`
                    inline-flex items-center justify-center gap-2
                    font-semibold rounded-full
                    transition-all duration-300
                    hover:shadow-xl
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                `}
            >
                {children}
            </Link>
        </motion.div>
    );
}
