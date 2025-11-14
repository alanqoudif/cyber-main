import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/context/preferences-context";

const poppins = Poppins({
  variable: "--font-poppins",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  display: "swap",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        data-theme="light"
        data-direction="ltr"
        data-locale="en"
        className={`${poppins.variable} ${tajawal.variable} antialiased bg-background text-foreground transition-colors`}
      >
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
