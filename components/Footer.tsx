"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0,209,255,0.1)",
        background: "linear-gradient(180deg, transparent 0%, rgba(2,14,33,0.95) 100%)",
        backdropFilter: "blur(12px)",
        padding: "40px 24px 28px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <Image
          src="/secupro-logo-official.png"
          alt="SecuPRO"
          width={48}
          height={48}
          style={{ opacity: 0.85 }}
        />

        {/* Liens légaux */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
          aria-label="Liens légaux"
        >
          <Link
            href="/mentions-legales"
            style={{
              color: "rgba(0,209,255,0.6)",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#00d1ff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,209,255,0.6)")}
          >
            Mentions Légales
          </Link>

          <span style={{ color: "rgba(0,209,255,0.2)", fontSize: "10px" }}>·</span>

          <Link
            href="/cgv"
            style={{
              color: "rgba(0,209,255,0.6)",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#00d1ff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,209,255,0.6)")}
          >
            CGV
          </Link>

          <span style={{ color: "rgba(0,209,255,0.2)", fontSize: "10px" }}>·</span>

          <a
            href="mailto:support@secupro.app"
            style={{
              color: "rgba(0,209,255,0.6)",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#00d1ff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,209,255,0.6)")}
          >
            Support
          </a>
        </nav>

        {/* Séparateur */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.15), transparent)",
          }}
        />

        {/* Copyright */}
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.35em",
            color: "rgba(0,209,255,0.2)",
            textAlign: "center",
          }}
        >
          © 2026 SecuPRO — SIRET 10335392600019 — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
