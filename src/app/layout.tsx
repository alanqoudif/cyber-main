import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  display: "swap",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "CyberMirror 2.0 | Cyber Awareness Simulation Platform",
  description:
    "CyberMirror 2.0 delivers immersive phishing and social engineering simulations with real-time analytics, adaptive risk scoring, and rich coaching experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        data-theme="light"
        className={`${inter.variable} ${notoArabic.variable} antialiased bg-background text-foreground transition-colors`}
      >
        {children}
      </body>
    </html>
  );
}
