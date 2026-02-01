import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <Features />
        {/* We can add a filler section here if needed to separate Features and Testimonials */}
        <div className="py-20 text-center bg-pink-50/50">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            We know your feelings, <br />
            <span className="text-primary">and we have the words.</span>
          </h2>
          {/* Placeholder for middle section visual */}
          <div className="container mx-auto px-6 mt-12">
            <div className="bg-white rounded-[3rem] shadow-xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-4">
                  Track your relationship milestones with{" "}
                  <span className="text-primary">LetterLove</span>
                </h3>
                <div className="h-2 w-full bg-pink-100 rounded-full mb-4">
                  <div className="h-2 w-2/3 bg-pink-500 rounded-full" />
                </div>
                <button className="px-6 py-3 bg-pink-500 text-white rounded-full font-bold text-sm">
                  See Timeline
                </button>
              </div>
              <div className="flex-1 h-64 bg-pink-50 rounded-[2rem] w-full flex items-center justify-center">
                <span className="text-6xl">📈</span>
              </div>
            </div>
          </div>
        </div>
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
