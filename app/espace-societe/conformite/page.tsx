"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, FileWarning } from "lucide-react";
import type { ComplianceAnalyse } from "@/app/api/espace-societe/compliance/route";

const dmSans = DM_Sans({ subsets: ["latin"] });

// ─── Design tokens (mêmes que le dashboard) ──────────────────────────────────

const L = {
  bgPage:    "#F8F9FB",
  bgCard:    "#FFFFFF",
  bgMuted:   "#F8F9FB",
  border:    "#E2E8F0",
  borderSub: "#F1F5F9",
  text:      "#0F172A",
  textSec:   "#64748B",
  textMuted: "#94A3B8",
  blue:      "#2563EB",
  red:       "#DC2626",
  amber:     "#D97706",
  green:     "#16A34A",
  blueBg:    "#EFF6FF",   blueText:  "#1D4ED8",
  redBg:     "#FEE2E2",   redText:   "#991B1B",
  amberBg:   "#FEF3C7",   amberText: "#92400E",
  greenBg:   "#DCFCE7",   greenText: "#166534",
} as const;

const card: React.CSSProperties = {
  background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: "8px",
};

const pill = (bg: string, text: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center",
  padding: "2px 8px", borderRadius: "999px",
  fontSize: "11px", fontWeight: 600,
  background: bg, color: text, whiteSpace: "nowrap",
});

const sectionLabel: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600,
  color: L.textSec, textTransform: "uppercase", letterSpacing: "0.08em",
};

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

// ─── Helpers score ────────────────────────────────────────────────────────────

function scoreConfig(score: number): { bg: string; text: string; barColor: string; label: string } {
  if (score >= 70) return { bg: L.greenBg, text: L.greenText, barColor: L.green, label: "Conforme" };
  if (score >= 40) return { bg: L.amberBg, text: L.amberText, barColor: L.amber, label: "Risque modéré" };
  return { bg: L.redBg, text: L.redText, barColor: L.red, label: "Risque élevé" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Composant carte analyse ──────────────────────────────────────────────────

function AnalyseCard({ a }: { a: ComplianceAnalyse }) {
  const [open, setOpen] = useState(false);
  const cfg = scoreConfig(a.score);

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: open ? `1px solid ${L.borderSub}` : "none",
        cursor: "pointer", gap: "12px",
      }} onClick={() => setOpen((v) => !v)}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "6px", flexShrink: 0,
            background: cfg.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FileWarning size={16} color={cfg.text} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: L.text, marginBottom: "2px" }}>
              {a.nom_document || "Document sans titre"}
            </div>
            <div style={{ fontSize: "11px", color: L.textMuted }}>{formatDate(a.created_at)}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Score badge */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: cfg.text, lineHeight: 1 }}>{a.score}</div>
            <div style={{ fontSize: "10px", color: L.textMuted }}>/ 100</div>
          </div>
          <span style={pill(cfg.bg, cfg.text)}>{cfg.label}</span>
          <span style={{ fontSize: "12px", color: L.textMuted, transform: open ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.15s" }}>▾</span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: "3px", background: L.border }}>
        <div style={{
          height: "100%", width: `${Math.max(a.score, 2)}%`,
          background: cfg.barColor, transition: "width 0.4s ease",
        }} />
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Risques */}
          {a.risques?.length > 0 && (
            <div>
              <div style={{ ...sectionLabel, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={11} color={L.red} /> Risques détectés ({a.risques.length})
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
                {a.risques.map((r, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: L.textSec }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: L.red, flexShrink: 0, marginTop: "5px" }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {a.actions?.length > 0 && (
            <div>
              <div style={{ ...sectionLabel, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={11} color={L.green} /> Actions correctives ({a.actions.length})
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
                {a.actions.map((a, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: L.textSec }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: L.green, flexShrink: 0, marginTop: "5px" }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: "6px" }}>
            <span style={pill(L.bgMuted, L.textSec)}>{a.type}</span>
            <span style={pill(cfg.bg, cfg.text)}>{a.statut}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ConformitePage() {
  const [analyses, setAnalyses] = useState<ComplianceAnalyse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/espace-societe/compliance")
      .then(async (res) => {
        const json = await res.json() as { analyses?: ComplianceAnalyse[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Erreur serveur");
        setAnalyses(json.analyses ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Statistiques
  const nbRisque    = analyses.filter((a) => a.statut === "risk").length;
  const scoresMoy   = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length)
    : 0;

  return (
    <div className={dmSans.className} style={{ background: L.bgPage, minHeight: "100vh", color: L.text, fontSize: "14px" }}>

      {/* ── Header sticky ─────────────────────────────────────────────────────── */}
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
            fontSize: "13px", fontWeight: 500, textDecoration: "none", flexShrink: 0,
          }}
        >
          <ArrowLeft size={14} /> Retour
        </Link>
      </header>

      {/* ── Contenu ────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Titre section */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "8px", background: L.blueBg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShieldCheck size={18} color={L.blue} />
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: L.text, margin: 0 }}>
                Conformité RGPD — Analyses documentaires
              </h1>
            </div>
            <p style={{ fontSize: "13px", color: L.textSec, margin: 0 }}>
              Données issues du projet <span style={{ fontWeight: 600, color: L.text }}>compliance-rgpd</span> · Powered by SecuPRO
            </p>
          </div>
          <span style={pill(L.amberBg, L.amberText)}>Beta</span>
        </div>

        {/* KPIs */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {[
              { label: "Documents analysés", val: analyses.length, iconBg: L.blueBg,  iconColor: L.blue,  sub: "dans la base" },
              { label: "Score moyen",        val: `${scoresMoy}/100`, iconBg: scoreConfig(scoresMoy).bg, iconColor: scoreConfig(scoresMoy).text, sub: "conformité RGPD" },
              { label: "À risque élevé",     val: nbRisque,   iconBg: L.redBg,   iconColor: L.red,   sub: "nécessitent action" },
            ].map(({ label, val, iconBg, iconColor, sub }) => (
              <div key={label} style={{ ...card, padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "7px", flexShrink: 0,
                  background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShieldCheck size={16} color={iconColor} />
                </div>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: L.text, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "12px", fontWeight: 500, color: L.text, marginTop: "2px" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: L.textMuted }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section analyses */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: `1px solid ${L.borderSub}`,
          }}>
            <div style={{ ...sectionLabel, display: "flex", alignItems: "center", gap: "7px" }}>
              <FileWarning size={14} color={L.textMuted} />
              Analyses de conformité RGPD — Base nationale
            </div>
            {!loading && (
              <span style={pill(L.blueBg, L.blueText)}>{analyses.length} document{analyses.length > 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{
              padding: "48px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "12px", color: L.textMuted,
            }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "13px" }}>Chargement des analyses…</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ ...pill(L.redBg, L.redText), margin: "0 auto 12px", display: "inline-flex" }}>
                Erreur de connexion
              </div>
              <p style={{ fontSize: "13px", color: L.textSec }}>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && analyses.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: L.textMuted }}>Aucune analyse disponible.</p>
            </div>
          )}

          {/* Data */}
          {!loading && !error && analyses.length > 0 && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {analyses.map((a) => <AnalyseCard key={a.id} a={a} />)}
            </div>
          )}
        </div>

        {/* Note technique */}
        <div style={{
          padding: "12px 16px", borderRadius: "8px",
          background: L.blueBg, border: `1px solid #BFDBFE`,
          fontSize: "12px", color: "#1E40AF", lineHeight: 1.6,
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>
            Les données affichées excluent le contenu brut des documents (RGPD).
            Seuls le score, les risques détectés et les actions correctives sont transmis via la fonction
            <code style={{ margin: "0 4px", padding: "1px 5px", borderRadius: "3px", background: "#DBEAFE", fontFamily: "monospace" }}>
              get_analyses_safe()
            </code>
            du projet <strong>compliance-rgpd</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
