import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" });
const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SkillRace — neon highway skill benchmark",
  description: "A/B race agent skills on speed and quality, rendered as a synthwave highway.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className={`${orbitron.variable} ${techMono.variable}`}>{children}</body>
  </html>
);

export default RootLayout;
