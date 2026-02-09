"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Facebook,
  Twitter,
  Mail,
  Copy,
  Check,
  Send,
  X,
  Share2,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `I wrote a letter for you... 💌\n${shareUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodedText}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-400 hover:bg-blue-500",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(
        "I wrote a letter for you... 💌",
      )}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color:
        "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(
        "I wrote a letter for you... 💌",
      )}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-500 hover:bg-gray-600",
      url: `mailto:?subject=A%20letter%20for%20you&body=${encodedText}`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/20"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold">
                Share Your Letter
              </h2>
              <p className="text-muted-foreground mt-2">
                Choose how you want to send your love
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform group-hover:scale-110 ${link.color}`}
                  >
                    <link.icon size={24} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>

            <div className="relative">
              <input
                readOnly
                value={shareUrl}
                className="w-full bg-muted/50 border border-border rounded-xl py-3.5 pl-4 pr-12 text-sm text-foreground/80 outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-background shadow-sm border border-transparent hover:border-border transition-all"
                title="Copy Link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
