"use client";

/**
 * Animated Button Component
 * Beautiful button with hover animations and new design system
 */

import { motion } from "framer-motion";
import Link from "next/link";

interface AnimatedButtonProps {
    href: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function AnimatedButton({
    href,
    children,
    variant = "primary",
    size = "md",
    className = ""
}: AnimatedButtonProps) {
    // Size classes
    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    // Variant classes using new design system
    const variantClasses = {
        primary: "bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] text-white shadow-lg shadow-[hsl(191,91%,37%,0.25)] hover:shadow-xl hover:shadow-[hsl(191,91%,37%,0.4)]",
        secondary: "bg-[hsl(0,0%,100%,0.1)] text-white border border-[var(--border)] backdrop-blur-sm hover:bg-[hsl(0,0%,100%,0.15)] hover:border-[var(--border-hover)]",
        ghost: "bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[hsl(0,0%,100%,0.05)]"
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
                    font-semibold rounded-xl
                    transition-all duration-300
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    ${className}
                `}
            >
                {children}
            </Link>
        </motion.div>
    );
}
