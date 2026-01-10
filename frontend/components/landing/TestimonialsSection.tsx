"use client";

/**
 * Testimonials Section
 * User testimonials with animated cards
 */

import { motion } from "framer-motion";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Junior Developer",
        avatar: "SC",
        quote: "I was intimidated by open source until I found OpenSource Compass. Within a week, I made my first PR to a React library!",
        gradient: "from-violet-500 to-purple-600"
    },
    {
        name: "Alex Kumar",
        role: "CS Student",
        avatar: "AK",
        quote: "The AI assistant is incredible. It explained a complex codebase in minutes and helped me understand exactly what changes to make.",
        gradient: "from-emerald-500 to-cyan-500"
    },
    {
        name: "Maria Santos",
        role: "Backend Developer",
        avatar: "MS",
        quote: "The skill matching is spot-on. Every issue recommendation was relevant to my Python experience. Highly recommend!",
        gradient: "from-amber-500 to-orange-500"
    }
];

export default function TestimonialsSection() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                    Success Stories
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                    Loved by Developers
                </h2>
                <p className="text-white/60 max-w-xl mx-auto text-lg">
                    Join hundreds of developers who started their open source journey with us
                </p>
            </motion.div>

            {/* Testimonial Cards */}
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group"
                    >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 h-full">
                            {/* Quote */}
                            <p className="text-white/80 text-lg leading-relaxed mb-8">
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-white font-semibold">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-white/50 text-sm">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
