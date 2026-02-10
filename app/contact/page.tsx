"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "motion/react";
import { Mail, MessageCircle, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen font-sans bg-pink-50/30">
      <Navbar />

      <main className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Get in <span className="text-pink-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Have questions, feedback, or just want to share a love story?
              We're all ears.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-pink-100/50 border border-pink-100 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6 text-pink-600">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Email Us
              </h3>
              <p className="text-gray-600 mb-6">
                For support, inquiries, or just to say hi. We typically respond
                within 24 hours.
              </p>
              <a
                href="mailto:suprabhat.work@gmail.com"
                className="px-8 py-3 bg-pink-600 text-white rounded-full font-bold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-pink-500/30"
              >
                suprabhat.work@gmail.com
              </a>
            </motion.div>

            {/* Socials Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-pink-100/50 border border-pink-100 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Social Media
              </h3>
              <p className="text-gray-600 mb-6">
                Follow us for updates, featured letters, and daily doses of
                romance.
              </p>
              <div className="flex gap-4">
                <SocialButton
                  href="https://x.com/suprabhat_3"
                  icon={<Twitter className="w-5 h-5" />}
                  label="Twitter"
                />
                <SocialButton
                  href="https://www.linkedin.com/in/suprabhatt/"
                  icon={<Linkedin className="w-5 h-5" />}
                  label="LinkedIn"
                />
                <SocialButton
                  href="https://github.com/suprabhat3"
                  icon={<Github className="w-5 h-5" />}
                  label="GitHub"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white text-center max-w-2xl mx-auto"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Need help with a generated letter?
            </h4>
            <p className="text-gray-600">
              If you're having trouble with the AI or need tips on how to get
              the best results, check out our{" "}
              <Link
                href="/#how-it-works"
                className="text-pink-600 hover:underline"
              >
                How it Works
              </Link>{" "}
              section or drop us a line!
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-pink-600 hover:border-pink-200 transition-all duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
