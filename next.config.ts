import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// La CSP (avec nonce par requête) est gérée dans middleware.ts.
// Ce fichier conserve uniquement les headers de sécurité statiques.
const securityHeaders = [
  {
    // ── CSP : source unique de vérité — next.config.ts uniquement ─────────
    // vercel.json ne doit PAS définir de Content-Security-Policy (conflit)
    key: "Content-Security-Policy",
    value: [
      // Fallback global
      "default-src 'self'",

      // Scripts : self + inline (Next.js) + LinkedIn badge + Sentry CDN
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
        " https://platform.linkedin.com" +
        " https://static.licdn.com" +
        " https://*.sentry.io",

      // Styles : self + inline (Tailwind/CSS-in-JS) + Google Fonts + LinkedIn
      "style-src 'self' 'unsafe-inline'" +
        " https://fonts.googleapis.com" +
        " https://static.licdn.com",

      // Polices : self + Google Fonts + LinkedIn
      "font-src 'self' data:" +
        " https://fonts.gstatic.com" +
        " https://static.licdn.com",

      // Images : self + data URI + blob (html-to-image) + tout HTTPS
      "img-src 'self' data: blob: https:",

      // Connexions réseau : Supabase REST + Supabase Realtime (WebSocket)
      // + Sentry + LinkedIn API + OpenAI (SecuAI) + Anthropic
      "connect-src 'self'" +
        " https://*.supabase.co" +
        " wss://*.supabase.co" +
        " https://sentry.io https://*.sentry.io" +
        " https://www.linkedin.com https://api.linkedin.com" +
        " https://api.anthropic.com",

      // Frames : uniquement LinkedIn badge
      "frame-src https://www.linkedin.com",

      // Empêche l'embedding de SecuPRO dans des iframes tierces
      "frame-ancestors 'none'",

      // Interdit les plugins (Flash, etc.)
      "object-src 'none'",

      // Empêche les injections via base href
      "base-uri 'self'",

      // Blob URLs autorisés (html-to-image génère un blob avant téléchargement)
      "worker-src 'self' blob:",
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
