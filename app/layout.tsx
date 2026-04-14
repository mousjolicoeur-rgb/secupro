import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeClient from "@/components/ThemeClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecuPRO — Gestion opérationnelle · Sécurité privée",
  description: "SecuPRO, la plateforme de gestion pour les agents et entreprises de sécurité privée.",
  icons: {
    icon: [
      { url: "/secupro-logo-official.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/secupro-logo-official.png",
    apple: [
      { url: "/secupro-logo-official.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeClient />
        {children}
      </body>
    </html>
  );
}
