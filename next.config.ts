import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// La CSP (avec nonce par requête) est gérée dans middleware.ts.
// Ce fichier conserve uniquement les headers de sécurité statiques.
const securityHeaders = [
  {
    // ── CSP : autorise self + inline + Supabase + Sentry ──────────────────
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://sentry.io https://*.sentry.io",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
  {
    // Empêche l'affichage dans une iframe (site pirate, clickjacking)
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Interdit au navigateur de deviner le type MIME
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Envoie uniquement l'origine dans le Referer, jamais le chemin complet
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Active le HSTS (force HTTPS pendant 1 an)
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Désactive les fonctionnalités inutiles (caméra, micro, géolocalisation)
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Active le préchargement DNS pour la performance
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Applique les headers de sécurité à toutes les routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      { source: "/app.html", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "secupro",
  project: "secupro-app",

  silent: true,

  // Tunnel /monitoring : les rapports Sentry passent par ton propre domaine
  // → évite les bloqueurs de pub des agents de sécurité
  tunnelRoute: "/monitoring",

  sourcemaps: {
    disable: true,
  },
});
