"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "motion/react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-sans bg-pink-50/30">
      <Navbar />

      <main className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-pink-100/50 border border-pink-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-8 text-center">
              Privacy <span className="text-pink-600">Policy</span>
            </h1>

            <div className="prose prose-pink prose-lg max-w-none text-gray-600 leading-relaxed">
              <p className="lead text-xl text-gray-700 font-medium mb-8">
                Your privacy is important to us. This policy explains how
                LetterLove collects, uses, and protects your information.
              </p>

              <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                1. Information We Collect
              </h3>
              <p>When you use LetterLove, we may collect:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Generated Content:</strong> The letters and messages
                  you create using our AI.
                </li>
                <li>
                  <strong>Usage Data:</strong> Anonymous analytics to help us
                  improve the website (e.g., which templates are most popular).
                </li>
                <li>
                  <strong>Authentication Data:</strong> If you sign in, we
                  simply store your basic profile info to save your history.
                </li>
              </ul>

              <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                2. How We Use Your Data
              </h3>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide and improve the LetterLove service.</li>
                <li>Generate the content you request.</li>
                <li>Ensure the security of our platform.</li>
              </ul>
              <p className="mt-4">
                We do <strong>not</strong> sell your personal data to third
                parties.
              </p>

              <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                3. AI Processing
              </h3>
              <p>
                To generate your letters, text inputs are processed by our AI
                provider. Data shared for generation is subject to
                their privacy policies but is not used to train their models by
                default.
              </p>

              <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                4. Cookies
              </h3>
              <p>
                We use cookies to remember your preferences and keep you logged
                in. You can control cookie settings in your browser.
              </p>

              <h3 className="text-2xl font-serif font-bold text-gray-800 mt-8 mb-4">
                5. Contact Us
              </h3>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="btn-primary px-6 py-3 rounded-full font-bold text-sm inline-block no-underline hover:text-white shadow-lg shadow-pink-200/50"
                >
                  Contact Support
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
                Last Updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
