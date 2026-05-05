import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ThemeClient from "@/components/ThemeClient";
import Footer from "@/components/Footer";

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
      <head>
        <Script id="linkedin-insight-init" strategy="beforeInteractive">{`
          _linkedin_partner_id = "535460075";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `}</Script>
        <Script id="linkedin-insight-tag" strategy="beforeInteractive">{`
          (function(l) {
            if (!l){ window.lintrk = function(a,b){ window.lintrk.q.push([a,b]) }; window.lintrk.q=[]; }
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript"; b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src="https://px.ads.linkedin.com/collect/?pid=535460075&fmt=gif" />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeClient />
        <div className="flex flex-col flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
