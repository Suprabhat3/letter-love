import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LetterLove - AI Powered Cute & Valentine Letters",
  description:
    "Create adorable, AI-powered valentine letters and love notes. Whether you need a cute confession or a heartfelt message, Eugene helps you express your feelings perfectly.",
  keywords: [
    "AI powered letter",
    "cute letters",
    "valentine letters",
    "love letters",
    "AI writing",
    "romantic letters",
    "confession letters",
    "apology letters",
    "Eugene love letters",
  ],
  openGraph: {
    title: "LetterLove - AI Powered Cute & Valentine Letters",
    description:
      "Create adorable, AI-powered valentine letters and love notes. Whether you need a cute confession or a heartfelt message, Eugene helps you express your feelings perfectly.",
    url: "https://letterlove.fun",
    siteName: "LetterLove",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LetterLove - AI Powered Letters",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Icons & Favicons
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetterLove - AI Powered Cute & Valentine Letters",
    description:
      "Create adorable, AI-powered valentine letters and love notes. Whether you need a cute confession or a heartfelt message, Eugene helps you express your feelings perfectly.",
    images: ["/og-image.png"],
    creator: "@LetterLoveAI",
  },
  metadataBase: new URL("https://letterlove.fun"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="8605b732-710b-4fe0-9820-13125e5e3bc4"
        ></script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${dancing.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
