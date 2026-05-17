"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const dmSans = DM_Sans({ subsets: ["latin"] });

const L = {
  bgPage:  "#F8F9FB",
  bgCard:  "#FFFFFF",
  border:  "#E2E8F0",
  text:    "#0F172A",
  textSec: "#64748B",
  textMuted: "#94A3B8",
  blue:    "#2563EB",
} as const;

const navTabStyle = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", padding: "0 14px",
  height: "56px",
  fontSize: "13px", fontWeight: active ? 600 : 400,
  color: active ? L.blue : L.textSec,
  borderBottom: `2px solid ${active ? L.blue : "transparent"}`,
  cursor: active ? "default" : "pointer",
  textDecoration: "none",
});

const NAV_TABS = [
  { label: "Tableau de bord", href: "/espace-societe/dashboard",  active: false },
  { label: "Conformité",      href: "/espace-societe/conformite", active: true  },
  { label: "Agents",          href: "/espace-societe/agents",     active: false },
] as const;

export default function ConformitePage() {
  return (
    <div
      className={dmSans.className}
      style={{ background: L.bgPage, minHeight: "100vh", color: L.text, fontSize: "14px" }}
    >
      {/* Header sticky — même design que le dashboard */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: L.bgCard, borderBottom: `1px solid ${L.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "56px", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: L.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              Secu<span style={{ color: L.blue }}>PRO</span>
              <span style={{ fontSize: "11px", fontWeight: 400, color: L.textMuted, marginLeft: "6px" }}>Business</span>
            </div>
            <div style={{ fontSize: "10px", color: L.textMuted, letterSpacing: "0.04em", marginTop: "1px" }}>
              Chef d&apos;exploitation
            </div>
          </div>

          <nav style={{ display: "flex", alignItems: "stretch", height: "56px", gap: "2px" }}>
            {NAV_TABS.map(({ label, href, active }) =>
              active ? (
                <div key={label} style={navTabStyle(true)}>{label}</div>
              ) : (
                <Link key={label} href={href} style={navTabStyle(false)}>{label}</Link>
              )
            )}
          </nav>
        </div>

        <Link
          href="/espace-societe/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            height: "36px", padding: "0 14px", borderRadius: "6px",
            background: L.bgCard, color: "#374151",
            border: `1px solid ${L.border}`,
            fontSize: "13px", fontWeight: 500, textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={14} /> Retour
        </Link>
      </header>

      {/* Contenu placeholder */}
      <div style={{
        maxWidth: "1440px", margin: "0 auto",
        padding: "0 24px",
        minHeight: "calc(100vh - 56px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: L.bgCard,
          border: `1px solid ${L.border}`,
          borderRadius: "12px",
          padding: "56px 48px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            background: "#EFF6FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <ShieldCheck size={24} color={L.blue} />
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: 700, color: L.text, marginBottom: "10px" }}>
            Module Conformité
          </h1>

          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 12px", borderRadius: "999px",
            background: "#FEF3C7", color: "#92400E",
            fontSize: "11px", fontWeight: 600,
            marginBottom: "20px",
          }}>
            En cours de déploiement
          </span>

          <p style={{ fontSize: "14px", color: L.textSec, lineHeight: 1.7, marginBottom: "28px" }}>
            Suivi des audits CNAPS, historique des contrôles, gestion documentaire
            réglementaire et rapports de conformité — ce module sera disponible prochainement.
          </p>

          <Link
            href="/espace-societe/dashboard"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              height: "40px", padding: "0 24px", borderRadius: "6px",
              background: L.blue, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 500, textDecoration: "none",
            }}
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
