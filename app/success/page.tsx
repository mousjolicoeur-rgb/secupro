import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnement activé — SecuPRO",
  description: "Votre abonnement Premium SecuPRO est actif.",
};

export default function SuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(155deg, #020c1b 0%, #04182e 30%, #061f3d 60%, #020e21 100%)",
        color: "#f8fafc",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Halo décoratif */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,209,255,0.10) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "480px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Image
          src="/secupro-logo-official.png"
          alt="SecuPRO"
          width={80}
          height={80}
          priority
          style={{
            filter:
              "drop-shadow(0 0 20px rgba(41,212,245,0.4)) drop-shadow(0 0 40px rgba(41,212,245,0.15))",
          }}
        />

        {/* Badge succès */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: "999px",
            padding: "6px 16px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#34d399",
              boxShadow: "0 0 8px rgba(52,211,153,0.9)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#34d399",
            }}
          >
            Paiement confirmé
          </span>
        </div>

        {/* Titre */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontSize: "clamp(2.8rem, 10vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "#ffffff",
              textShadow: "0 0 40px rgba(255,255,255,0.15)",
              margin: 0,
            }}
          >
            MERCI&nbsp;
            <span
              style={{
                color: "#00d1ff",
                textShadow:
                  "0 0 18px rgba(0,209,255,0.9), 0 0 40px rgba(0,209,255,0.5)",
              }}
            >
              !
            </span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#94a3b8",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Votre abonnement{" "}
            <strong style={{ color: "#f1f5f9" }}>Premium</strong> est activé.
            <br />
            Vous avez désormais un accès illimité au{" "}
            <strong style={{ color: "#00d1ff" }}>Hub Agent</strong>.
          </p>
        </div>

        {/* Séparateur */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,209,255,0.3), transparent)",
          }}
        />

        {/* Boutons principaux */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Retour au Hub — CTA principal */}
          <Link
            href="/agent/hub"
            style={{
              display: "block",
              width: "100%",
              padding: "17px 0",
              background:
                "linear-gradient(135deg, #0095c8 0%, #00d1ff 50%, #0ab8e8 100%)",
              color: "#020e21",
              fontSize: "13px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              textDecoration: "none",
              borderRadius: "16px",
              boxShadow:
                "0 0 32px rgba(0,209,255,0.45), 0 4px 20px rgba(0,209,255,0.25)",
              textAlign: "center",
            }}
          >
            Accéder au Hub Agent →
          </Link>

          {/* Donner son avis */}
          <a
            href="mailto:contact@secupro.app?subject=Mon%20avis%20sur%20SecuPRO&body=Bonjour%2C%0A%0AVoici%20mon%20avis%20sur%20SecuPRO%20:%0A%0A"
            style={{
              display: "block",
              width: "100%",
              padding: "16px 0",
              background: "rgba(0,209,255,0.04)",
              color: "#00d1ff",
              fontSize: "13px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              textDecoration: "none",
              borderRadius: "16px",
              border: "1px solid rgba(0,209,255,0.32)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            ★ Donner mon avis
          </a>
        </div>

        {/* Section aide */}
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(148,163,184,0.6)",
              margin: 0,
            }}
          >
            Besoin d&apos;aide ?
          </p>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
            Notre équipe est disponible pour vous accompagner.
          </p>
          <a
            href="mailto:support@secupro.app"
            style={{
              color: "#00d1ff",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.03em",
            }}
          >
            support@secupro.app
          </a>
        </div>

        {/* Liens légaux */}
        <div style={{ display: "flex", gap: "16px", opacity: 0.5 }}>
          <Link
            href="/mentions-legales"
            style={{ color: "#64748b", fontSize: "10px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            Mentions légales
          </Link>
          <span style={{ color: "#334155", fontSize: "10px" }}>·</span>
          <Link
            href="/cgv"
            style={{ color: "#64748b", fontSize: "10px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            CGV
          </Link>
        </div>
      </div>
    </div>
  );
}
