import Hero from "@/components/landing/Hero";
import Search from "@/components/landing/Search";
import Navbar from "@/components/landing/Navbar";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TrendingSkills from "@/components/landing/TrendingSkills";
import LiveStats from "@/components/landing/LiveStats";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <Search />
        <Features />
        <HowItWorks />
        <TrendingSkills />
        <LiveStats />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
