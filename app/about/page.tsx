"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "motion/react";
import Image from "next/image";
import { SparklesIcon } from "@/components/SparklesIcon";
import { HeartIcon } from "@/components/HeartIcon";
import { GlobeIcon } from "@/components/GlobeIcon";

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-pink-50/30">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-12 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Where Feelings Meet <span className="text-pink-500">AI</span> to
              Create the Perfect Words.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
              LetterLove isn't just a tool, it's your personal cupid. We help
              you articulate the emotions that are often too hard to say,
              wrapping them in beautiful, AI-crafted letters.
            </p>
          </motion.div>

          <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>
        </section>

        {/* What We Do Section */}
        <section className="px-6 lg:px-12 py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
                What We Do
              </h2>
              <div className="w-24 h-1 bg-pink-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<HeartIcon className="w-8 h-8 text-red-500" />}
                title="Heartfelt Expressions"
                description="We translate your raw feelings into polished, touching letters. Whether it's love, apology, or gratitude, we find the right words."
              />
              <FeatureCard
                icon={<SparklesIcon className="w-8 h-8 text-yellow-500" />}
                title="AI-Powered Magic"
                description="Our smart AI, Eugene, understands context and nuance, crafting messages that feel personal and authentic, not robotic."
              />
              <FeatureCard
                icon={<GlobeIcon className="w-8 h-8 text-blue-500" />}
                title="Universal Connection"
                description="Love implies no language barriers. We help you connect with loved ones, bridging gaps with perfectly phrased sentiments."
              />
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="px-6 lg:px-12 py-20">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-pink-100/50 border border-pink-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 bg-white">
                  <Image
                    src="/founder.png"
                    alt="Founder"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                  <span className="text-2xl">👋</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-pink-600 font-semibold tracking-wide uppercase mb-2">
                  Know the Founder
                </h3>
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
                  Hi, I'm Suprabhat!
                </h2>

                <div className="prose prose-lg text-gray-600 leading-relaxed space-y-4">
                  <p>
                    I built{" "}
                    <span className="font-semibold text-pink-500">
                      LetterLove
                    </span>{" "}
                    with a simple belief: everyone deserves to feel special, but
                    not everyone finds it easy to put their feelings into words.
                  </p>
                  <p>
                    As a developer and a romantic at heart, I wanted to combine
                    technology with emotion. I realized that in our fast-paced
                    digital world, the art of letter writing was fading.
                    LetterLove is my attempt to bring it back, modernized,
                    accessible, and just as touching.
                  </p>
                  <p>
                    When I'm not coding, you'll find me exploring new coffee
                    shops, reading, or dreaming up new ways to make the internet
                    a friendlier, warmer place.
                  </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://x.com/suprabhat_3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                    Follow on X
                  </a>
                  <a
                    href="https://www.linkedin.com/in/suprabhatt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors text-gray-700 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-white border border-pink-50 shadow-lg shadow-pink-100/20 hover:shadow-xl hover:shadow-pink-100/40 transition-all duration-300"
    >
      <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
