"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  User, Calendar, FileText, MessageSquare,
  CalendarCheck, Banknote, Bot, Scale, Bell, Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ── Module definitions ─────────────────────────────────────────────────────────

interface ModuleDef {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

const FEATURED: ModuleDef = {
  icon: CalendarCheck,
  label: "Planning",
  href: "/agent/planning",
  color: "#3B82F6",
};

const GRID_MODULES: ModuleDef[] = [
  { icon: User,          label: "Profil",        href: "/agent/profil",    color: "#94A3B8" },
  { icon: Calendar,      label: "Calendrier",    href: "/agent/calendrier",color: "#94A3B8" },
  { icon: FileText,      label: "Documents",     href: "/agent/docs",      color: "#22D3EE" },
  { icon: MessageSquare, label: "Support",       href: "/agent/support",   color: "#64748B" },
  { icon: Banknote,      label: "Analyse Paie",  href: "/agent/paie",      color: "#10B981" },
  { icon: Bot,           label: "Séculia IA",    href: "/agent/secu-ai",   color: "#06B6D4" },
  { icon: Scale,         label: "SecDroit",      href: "/agent/code",      color: "#8B5CF6" },
  { icon: Bell,          label: "Alertes CNAPS", href: "/agent/hub",       color: "#F59E0B" },
];

const PRO: ModuleDef = {
  icon: Shield,
  label: "Espace PRO",
  href: "/agent/espace-pro",
  color: "#EAB308",
};

// ── ModuleCard ─────────────────────────────────────────────────────────────────

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const [hovered, setHovered] = useState(false);
  const Icon = mod.icon;
  return (
    <Link
      href={mod.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "22px 16px",
        background: hovered ? `${mod.color}0D` : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? `${mod.color}40` : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        textDecoration: "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 200ms ease, background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
        boxShadow: hovered ? `0 8px 24px ${mod.color}18` : "none",
      }}
    >
      <Icon size={28} color={mod.color} strokeWidth={1.5} />
      <span style={{
        color: "#CBD5E1",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        {mod.label}
      </span>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PageAgent() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [hoveredFeatured, setHoveredFeatured] = useState(false);
  const [hoveredPro, setHoveredPro] = useState(false);

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) setFirstName(data.full_name.split(" ")[0]);
      else if (user.email) setFirstName(user.email.split("@")[0]);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0C10",
      backgroundImage:
        "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 60%)",
      fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      color: "#F1F5F9",
    }}>

      {/* ── Accent bar ─────────────────────────────────────────────────────── */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)",
      }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/secupro-logo.svg" alt="SecuPRO" height={28} style={{ display: "block" }} />

        <div style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9" }}>
          {firstName ? `Bonjour, ${firstName}` : "Bonjour"}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {time && (
            <span style={{
              fontSize: "12px",
              color: "#475569",
              letterSpacing: "0.06em",
              fontVariantNumeric: "tabular-nums",
            }}>
              {time}
            </span>
          )}
          <span style={{
            padding: "3px 10px",
            borderRadius: "999px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.18)",
            color: "#4ADE80",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}>
            100% Gratuit ✓
          </span>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 20px 96px" }}>

        {/* Page title */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{
            margin: 0,
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#F8FAFC",
          }}>
            {firstName ?? "Mon Espace"}
          </h1>
          <p style={{
            margin: "6px 0 0",
            fontSize: "11px",
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}>
            Sécurité privée · IDCC 1351
          </p>
        </div>

        {/* ── Asymmetric top row ───────────────────────────────────────────── */}
        {/* [Planning 2/3] [Profil]     */}
        {/* [Planning 2/3] [Calendrier] */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gridTemplateRows: "auto auto",
          gap: "12px",
          marginBottom: "12px",
        }}>
          {/* Planning — featured */}
          <Link
            href={FEATURED.href}
            onMouseEnter={() => setHoveredFeatured(true)}
            onMouseLeave={() => setHoveredFeatured(false)}
            style={{
              gridRow: "1 / 3",
              padding: "36px 32px",
              background: hoveredFeatured
                ? "rgba(59,130,246,0.08)"
                : "rgba(59,130,246,0.04)",
              border: `1px solid ${hoveredFeatured
                ? "rgba(59,130,246,0.35)"
                : "rgba(59,130,246,0.12)"}`,
              borderRadius: "20px",
              backdropFilter: "blur(12px)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: "16px",
              minHeight: "200px",
              transform: hoveredFeatured ? "translateY(-2px)" : "translateY(0)",
              transition: "transform 200ms ease, background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
              boxShadow: hoveredFeatured
                ? "0 12px 40px rgba(59,130,246,0.12)"
                : "none",
            }}
          >
            <CalendarCheck size={36} color="#3B82F6" strokeWidth={1.5} />
            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#3B82F6",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Planning
              </div>
              <div style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                Consultez vos prochaines vacations
              </div>
            </div>
          </Link>

          {/* Profil */}
          <ModuleCard mod={GRID_MODULES[0]} />

          {/* Calendrier */}
          <ModuleCard mod={GRID_MODULES[1]} />
        </div>

        {/* ── Secondary 3-col grid ────────────────────────────────────────── */}
        {/* Documents · Support · Analyse Paie */}
        {/* Séculia IA · SecDroit · Alertes CNAPS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "12px",
        }}>
          {GRID_MODULES.slice(2).map((mod) => (
            <ModuleCard key={mod.label} mod={mod} />
          ))}
        </div>

        {/* ── Espace PRO — full width ──────────────────────────────────────── */}
        <Link
          href={PRO.href}
          onMouseEnter={() => setHoveredPro(true)}
          onMouseLeave={() => setHoveredPro(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "22px 28px",
            background: hoveredPro
              ? "rgba(234,179,8,0.06)"
              : "rgba(234,179,8,0.03)",
            border: `1px solid ${hoveredPro
              ? "rgba(234,179,8,0.30)"
              : "rgba(234,179,8,0.12)"}`,
            borderRadius: "18px",
            backdropFilter: "blur(12px)",
            textDecoration: "none",
            transform: hoveredPro ? "translateY(-2px)" : "translateY(0)",
            transition: "transform 200ms ease, background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
            boxShadow: hoveredPro ? "0 8px 32px rgba(234,179,8,0.08)" : "none",
          }}
        >
          <Shield size={30} color="#EAB308" strokeWidth={1.5} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#EAB308",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "4px",
            }}>
              Espace PRO
            </div>
            <div style={{ fontSize: "13px", color: "#475569" }}>
              Votre espace professionnel certifié
            </div>
          </div>
          <span style={{ fontSize: "18px", color: "#EAB30866" }}>→</span>
        </Link>

      </main>
    </div>
  );
}
