import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Récupère le host Supabase depuis l'env (ex. ladvecmpjpictubnnnsq.supabase.co)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "*.supabase.co";

const SENTRY_REPORT_URI =
  "https://o4511165590667264.ingest.de.sentry.io/api/4511165599449168/security/?sentry_key=b3db3aeb701708f76b52680049ac1d59";

const contentSecurityPolicy = [
  // Tout bloquer par défaut sauf 'self'
  "default-src 'self'",

  // Scripts : Next.js 15 injecte des scripts inline lors de l'hydratation
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

  // Styles : Tailwind + Google Fonts (Geist)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Polices Google Fonts
  "font-src 'self' data: https://fonts.gstatic.com",

  // Images : Supabase Storage, tuiles OpenStreetMap (Leaflet), data URIs, blobs
  `img-src 'self' data: blob: https://${supabaseHost} https://*.tile.openstreetmap.org`,

  // Connexions réseau : Supabase (REST + WebSocket), Sentry (tunnel /monitoring + ingest direct), Anthropic
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://o4511165590667264.ingest.de.sentry.io`,

  // Web Workers : Tesseract.js + PDF.js utilisent des workers en blob:
  "worker-src 'self' blob:",
  "child-src 'self' blob:",

  // Médias (vidéo/audio)
  "media-src 'self' blob:",

  // Iframes : interdites (équivalent X-Frame-Options DENY)
  "frame-src 'none'",
  "frame-ancestors 'none'",

  // Sécurité de base
  "base-uri 'self'",
  "form-action 'self'",

  // Rapport de violations vers Sentry
  `report-uri ${SENTRY_REPORT_URI}`,
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
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
