"use client";

/**
 * Landing Page - OpenSource Compass
 * 
 * A beautiful, animated landing page for the OpenSource Compass platform.
 * Uses Framer Motion for animations and component-based architecture.
 */

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <FloatingOrbs />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
