"use client";

/**
 * Skeleton Loading Components
 * Shimmer effect for loading states
 */

import { motion } from "framer-motion";

// Base skeleton with shimmer animation
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden bg-[hsl(0,0%,100%,0.05)] rounded-lg ${className}`}
        >
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[hsl(0,0%,100%,0.1)] to-transparent"
                animate={{ translateX: ["−100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            <div className="flex items-center gap-6">
                {/* Avatar skeleton */}
                <Skeleton className="w-20 h-20 rounded-2xl" />

                <div className="flex-1 space-y-3">
                    {/* Name */}
                    <Skeleton className="h-7 w-48" />
                    {/* Username */}
                    <Skeleton className="h-5 w-32" />
                    {/* Tags */}
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Stats Grid Skeleton
export function StatsGridSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="glass-card p-5"
                >
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// Issue Card Skeleton
export function IssueCardSkeleton() {
    return (
        <div className="p-5 rounded-xl bg-[hsl(0,0%,100%,0.02)] border border-[var(--border)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    {/* Title */}
                    <Skeleton className="h-6 w-3/4" />
                    {/* Repo */}
                    <Skeleton className="h-4 w-40" />
                    {/* Description */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    {/* Labels */}
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                </div>
                {/* Score badge */}
                <Skeleton className="w-14 h-14 rounded-xl" />
            </div>
        </div>
    );
}

// Issues List Skeleton (multiple cards)
export function IssuesListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
        >
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                >
                    <IssueCardSkeleton />
                </motion.div>
            ))}
        </motion.div>
    );
}
