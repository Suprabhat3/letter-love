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
      <body
        className={`${inter.variable} ${playfair.variable} ${dancing.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
