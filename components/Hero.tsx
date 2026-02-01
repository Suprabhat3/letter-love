import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="blob-bg top-[-20%] left-[-10%] bg-pink-200/40 w-[800px] h-[800px]" />
        <div className="blob-bg top-[10%] right-[-10%] bg-purple-200/40 w-[600px] h-[600px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white shadow-sm mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground/80">
            AI-Powered Love Letters
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-foreground">
          Know Your Heart, <br />
          <span className="text-gradient">Share Your Love.</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl leading-relaxed">
          Transform your scattered thoughts and memories into beautifully
          crafted love letters, poems, and notes. The perfect way to say exactly
          what you mean.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/create"
            className="btn-primary px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Write a Letter
          </Link>
          <button className="px-8 py-4 rounded-full bg-white text-foreground font-semibold border border-pink-100 hover:bg-pink-50 transition-colors">
            View Examples
          </button>
        </div>

        {/* Hero Visual - 3 Phone Layout */}
        <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] flex justify-center items-center">
          {/* Left Phone (Behind) */}
          <div className="absolute md:left-[15%] z-10 hidden md:block transform -translate-x-1/4 translate-y-12 -rotate-12 scale-90 opacity-90 transition-all hover:z-30 hover:scale-95 hover:rotate-0 duration-500">
            <div className="w-[280px] h-[580px] bg-white rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-6 bg-white z-20 flex justify-center">
                <div className="w-20 h-4 bg-black/10 rounded-b-xl" />
              </div>
              {/* Screen Content */}
              <div className="w-full h-full bg-pink-50/50 p-6 pt-12 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-purple-200" />
                  <div className="text-xs font-bold text-foreground/70">
                    Past Letters
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl shadow-sm border border-pink-100/50"
                    >
                      <div className="h-2 w-16 bg-pink-100 rounded-full mb-2" />
                      <div className="h-2 w-full bg-gray-100 rounded-full mb-1" />
                      <div className="h-2 w-3/4 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone (Behind) */}
          <div className="absolute md:right-[15%] z-10 hidden md:block transform translate-x-1/4 translate-y-12 rotate-12 scale-90 opacity-90 transition-all hover:z-30 hover:scale-95 hover:rotate-0 duration-500">
            <div className="w-[280px] h-[580px] bg-white rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-6 bg-white z-20 flex justify-center">
                <div className="w-20 h-4 bg-black/10 rounded-b-xl" />
              </div>
              {/* Screen Content */}
              <div className="w-full h-full bg-purple-50/50 p-6 pt-12 flex flex-col">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 shadow-sm flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <h4 className="font-bold text-sm">Advice</h4>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                  <h5 className="font-bold text-xs mb-2 text-pink-500">
                    How to say sorry
                  </h5>
                  <p className="text-[10px] text-gray-400">
                    Be sincere, acknowledge feelings...
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <h5 className="font-bold text-xs mb-2 text-purple-500">
                    Anniversary Tips
                  </h5>
                  <p className="text-[10px] text-gray-400">
                    Remember the small details...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Phone (Main) */}
          <div className="relative z-20 transform transition-transform hover:scale-105 duration-500">
            <div className="w-[300px] h-[620px] bg-white rounded-[3.5rem] border-[8px] border-white shadow-2xl overflow-hidden relative ring-1 ring-black/5">
              {/* Notch/Camera */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-white z-20 flex justify-center">
                <div className="w-24 h-5 bg-black rounded-b-xl" />
              </div>

              {/* Main Screen Content */}
              <div className="w-full h-full bg-white flex flex-col relative">
                {/* Header bg */}
                <div className="h-1/3 bg-gradient-to-b from-pink-100 to-white p-6 pt-12 flex flex-col items-center text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
                    Drafting
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">
                    My Dearest...
                  </h3>
                </div>

                {/* Circle Visual */}
                <div className="absolute top-[25%] left-1/2 -translate-x-1/2">
                  <div className="w-40 h-40 rounded-full bg-yellow-100 flex items-center justify-center relative border-4 border-white shadow-lg">
                    <div className="w-32 h-32 rounded-full bg-yellow-200/50 flex items-center justify-center text-5xl">
                      💌
                    </div>
                    {/* Ring Progress */}
                    <svg
                      className="absolute w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="transparent"
                        stroke="#fbcfe8"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="transparent"
                        stroke="#ec4899"
                        strokeWidth="8"
                        strokeDasharray="289"
                        strokeDashoffset="100"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Rest of Content */}
                <div className="mt-20 px-6 text-center">
                  <p className="text-sm text-foreground/60 italic mb-8">
                    "The way you laugh at my terrible jokes makes every day
                    brighter. I wanted to tell you..."
                  </p>

                  <button className="w-full py-3 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:bg-pink-600 transition-colors">
                    Log Response
                  </button>
                </div>

                {/* Bottom Nav */}
                <div className="mt-auto border-t border-gray-100 p-4 flex justify-around text-gray-400">
                  <div className="flex flex-col items-center gap-1 text-pink-500">
                    <div className="w-5 h-5 bg-pink-500 rounded-md" />
                    <span className="text-[10px] font-medium">Home</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-gray-200 rounded-md" />
                    <span className="text-[10px] font-medium">Drafts</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-gray-200 rounded-md" />
                    <span className="text-[10px] font-medium">Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
