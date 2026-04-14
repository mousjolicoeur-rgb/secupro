"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  MessageSquare,
  BadgeEuro,
  Calendar,
  User,
  ShieldCheck,
  Lock,
  Zap,
  Download,
} from "lucide-react";
import Link from "next/link";

// ─── VERROU PAYWALL (intégré ici, aucun import externe) ───────────────────────
function Verrou({ children, bloque }: { children: React.ReactNode; bloque: boolean }) {
  if (!bloque) return <>{children}</>;

  return (
    <div
      style={{
        border: "3px solid #f59e0b",
        borderRadius: "20px",
        background: "#0f172a",
        padding: "48px 32px",
        margin: "12px 0",
        textAlign: "center",
        boxShadow: "0 0 60px rgba(245,158,11,0.15)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: "16px",
          borderRadius: "50%",
          background: "#f59e0b",
          color: "#000",
          marginBottom: "20px",
          animation: "bounce 1s infinite",
        }}
      >
        <Lock size={32} />
      </div>
      <h2
        style={{
          color: "#f59e0b",
          fontSize: "22px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "10px",
        }}
      >
        Accès Premium Requis
      </h2>
      <p style={{ color: "#cbd5e1", fontSize: "14px", marginBottom: "28px", maxWidth: "320px", margin: "0 auto 28px" }}>
        Ces modules sont réservés aux agents abonnés.{" "}
        <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "18px" }}>9.99€/mois</span>
        , sans engagement.
      </p>
      <a
        href="https://buy.stripe.com/28E6oAbTU3ZwaO92FI5gc01"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          background: "#f59e0b",
          color: "#000",
          padding: "14px 40px",
          borderRadius: "999px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "13px",
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(245,158,11,0.4)",
          transition: "transform 0.2s",
        }}
      >
        S&apos;abonner maintenant
      </a>
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function AgentLanding() {
  const [mounted, setMounted] = useState(false);

  // ⚙️  CONTRÔLE ACCÈS — false = verrou actif / true = accès complet
  const isPremium = false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "16px 16px 96px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* ── ZONE GRATUITE ─────────────────────────────────────────────── */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#4ade80",
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: "#4ade80",
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            Modules Gratuits
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
          className="md:grid-cols-4"
        >
          {[
            { icon: <User size={22} />, label: "Profil", color: "#94a3b8" },
            { icon: <Calendar size={22} />, label: "Calendrier", color: "#94a3b8" },
            { icon: <FileText size={22} />, label: "Documents", color: "#22d3ee" },
            { icon: <MessageSquare size={22} />, label: "Support", color: "#94a3b8" },
          ].map(({ icon, label, color }) => (
            <div
              key={label}
              style={{
                padding: "20px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                color,
              }}
            >
              {icon}
              <span
                style={{
                  color: "#e2e8f0",
                  fontSize: "9px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ZONE PREMIUM ──────────────────────────────────────────────── */}
      <section>
        <div
          style={{
            color: "#f59e0b",
            fontSize: "10px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            marginBottom: "12px",
          }}
        >
          Services Premium — 9.99€/mois
        </div>

        <Verrou bloque={!isPremium}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {[
              { icon: <Download size={22} />, label: "Planning de Mission", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", color: "#60a5fa" },
              { icon: <BadgeEuro size={22} />, label: "Bulletins de Paie", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", color: "#c084fc" },
              { icon: <Zap size={22} />, label: "Secu AI Intelligence", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", color: "#fbbf24" },
              { icon: <ShieldCheck size={22} />, label: "Veille Tactique", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "#f87171" },
            ].map(({ icon, label, bg, border, color }) => (
              <div
                key={label}
                style={{
                  padding: "24px",
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color,
                }}
              >
                {icon}
                <span
                  style={{
                    color: "#f1f5f9",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Verrou>
      </section>
    </div>
  );
}
