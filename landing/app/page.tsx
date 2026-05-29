import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ESGSection from "@/components/ESGSection";
import Comparison from "@/components/Comparison";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <ESGSection />
      <Comparison />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
