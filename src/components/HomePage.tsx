"use client";

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), { ssr: false });
const AboutSection = dynamic(() => import('@/components/sections/AboutSection'), { ssr: false });
const FeaturesSection = dynamic(() => import('@/components/sections/FeaturesSection'), { ssr: false });
const PricingSection = dynamic(() => import('@/components/sections/PricingSection'), { ssr: false });
const EventCategoriesSection = dynamic(() => import('@/components/sections/EventCategoriesSection'), { ssr: false });
const PlanningProcessSection = dynamic(() => import('@/components/sections/PlanningProcessSection'), { ssr: false });
const SuccessStoriesSection = dynamic(() => import('@/components/sections/SuccessStoriesSection'), { ssr: false });
const BlogPreviewSection = dynamic(() => import('@/components/sections/BlogPreviewSection'), { ssr: false });
const MobileAppSection = dynamic(() => import('@/components/sections/MobileAppSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/sections/FAQSection'), { ssr: false });
const ContactSection = dynamic(() => import('@/components/sections/ContactSection'), { ssr: false });
const FooterSection = dynamic(() => import('@/components/sections/FooterSection'), { ssr: false });

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PricingSection />
      <EventCategoriesSection />
      <PlanningProcessSection />
      <SuccessStoriesSection />
      <BlogPreviewSection />
      <MobileAppSection />
      <FAQSection />
      <ContactSection />
      <FooterSection />
    </main>
  );
} 