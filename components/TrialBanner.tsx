"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TRIAL_DAYS = 7;
const STRIPE_URL = "https://buy.stripe.com/28E6oAbTU3ZwaO92FI5gc01";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
};

function calcRemaining(createdAt: string): Remaining | null {
  const trialEnd =
    new Date(createdAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const diff = trialEnd - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    totalMs: diff,
  };
}

export default function TrialBanner() {
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<Remaining | null | "loading">(
    "loading"
  );

  // Récupère la date d'inscription depuis Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCreatedAt(data.user?.created_at ?? null);
    });
  }, []);

  // Recalcule le temps restant chaque minute
  useEffect(() => {
    if (createdAt === null) {
      setRemaining(null);
      return;
    }
    const update = () => setRemaining(calcRemaining(createdAt));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [createdAt]);

  // Pas encore chargé ou essai expiré
  if (remaining === "loading" || remaining === null) return null;

  const isCritical = remaining.totalMs < 24 * 60 * 60 * 1000;

  // Couleurs dynamiques selon l'urgence
  const accentColor = isCritical ? "#f97316" : "#00d1ff";
  const accentGlow = isCritical
    ? "rgba(249,115,22,0.35)"
    : "rgba(0,209,255,0.25)";
  const borderColor = isCritical
    ? "rgba(249,115,22,0.4)"
    : "rgba(0,209,255,0.3)";
  const bgColor = isCritical
    ? "rgba(249,115,22,0.04)"
    : "rgba(0,209,255,0.04)";

  // Formatage du message
  const parts: string[] = [];
  if (remaining.days > 0)
    parts.push(`${remaining.days} jour${remaining.days > 1 ? "s" : ""}`);
  if (remaining.hours > 0 || remaining.days > 0)
    parts.push(`${remaining.hours} heure${remaining.hours > 1 ? "s" : ""}`);
  parts.push(`${remaining.minutes} minute${remaining.minutes > 1 ? "s" : ""}`);

  const timeString = parts.join(", ");

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        marginBottom: "24px",
        padding: "16px 20px",
        borderRadius: "16px",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: `0 0 28px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      {/* Indicateur + texte */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
          minWidth: "0",
        }}
      >
        {/* Dot pulsant */}
        <span
          style={{
            flexShrink: 0,
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
            display: "inline-block",
            animation: "trialPulse 1.8s ease-in-out infinite",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {/* Label eyebrow */}
          <p
            style={{
              margin: 0,
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              color: isCritical
                ? "rgba(249,115,22,0.65)"
                : "rgba(0,209,255,0.55)",
            }}
          >
            {isCritical ? "⚠ Accès limité — Urgence" : "Accès gratuit en cours"}
          </p>

          {/* Compte à rebours */}
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.4,
            }}
          >
            Il vous reste{" "}
            <span
              style={{
                color: accentColor,
                fontWeight: 900,
                textShadow: `0 0 12px ${accentGlow}`,
              }}
            >
              {timeString}
            </span>{" "}
            d&apos;essai gratuit.
          </p>
        </div>
      </div>

      {/* CTA Passer en PRO */}
      <a
        href={STRIPE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "9px 18px",
          borderRadius: "10px",
          background: isCritical
            ? "linear-gradient(135deg, #ea580c, #f97316)"
            : "linear-gradient(135deg, #0095c8, #00d1ff)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          textDecoration: "none",
          boxShadow: `0 0 20px ${accentGlow}`,
          transition: "transform 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform =
            "translateY(-1px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 30px ${accentGlow}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform =
            "translateY(0)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 20px ${accentGlow}`;
        }}
      >
        ⚡ Passer en PRO
      </a>

      {/* Keyframe injecté via style tag */}
      <style>{`
        @keyframes trialPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
