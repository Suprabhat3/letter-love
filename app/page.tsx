import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import MilestoneTracker from "@/components/MilestoneTracker";
import SupportMe from "@/components/SupportMe";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        <MilestoneTracker />
        <Testimonials />
        <SupportMe />
      </main>
      <Footer />
    </div>
  );
}
