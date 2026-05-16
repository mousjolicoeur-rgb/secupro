"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  FileText,
  MessageSquare,
  CalendarCheck,
  Banknote,
  Bot,
  Scale,
  Bell,
  BarChart2,
} from "lucide-react";

const MODULES = [
  { icon: User,          label: "Profil",         href: "/agent/profil",    color: "#94a3b8" },
  { icon: Calendar,      label: "Calendrier",      href: "/agent/calendrier",color: "#94a3b8" },
  { icon: FileText,      label: "Documents",       href: "/agent/docs",      color: "#22d3ee" },
  { icon: MessageSquare, label: "Support",         href: "/agent/support",   color: "#94a3b8" },
  { icon: CalendarCheck, label: "Planning",        href: "/agent/planning",  color: "#94a3b8" },
  { icon: Banknote,      label: "Analyse Paie",    href: "/agent/paie",      color: "#94a3b8" },
  { icon: Bot,           label: "Séculia IA",      href: "/agent/secu-ai",   color: "#22d3ee" },
  { icon: Scale,         label: "SecDroit",        href: "/agent/code",      color: "#94a3b8" },
  { icon: Bell,          label: "Alertes CNAPS",   href: "/agent/hub",       color: "#f59e0b" },
  { icon: BarChart2,     label: "Performances",    href: "/performance",     color: "#94a3b8" },
];

export default function AgentLanding() {
  const [mounted, setMounted] = useState(false);

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
        gap: "24px",
      }}
    >
      {/* ── Section label ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
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
          Mes Modules
        </span>
      </div>

      {/* ── Modules grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
        className="md:grid-cols-4 sm:grid-cols-3"
      >
        {MODULES.map(({ icon: Icon, label, href, color }) => (
          <Link
            key={label}
            href={href}
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
              textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <Icon size={22} />
            <span
              style={{
                color: "#e2e8f0",
                fontSize: "9px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "center",
              }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
