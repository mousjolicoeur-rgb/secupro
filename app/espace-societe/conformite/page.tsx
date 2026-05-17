"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import {
  ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2,
  Loader2, FileWarning, Upload, Download, X, FileText,
} from "lucide-react";
import type { ComplianceAnalyse } from "@/app/api/espace-societe/compliance/route";

const dmSans = DM_Sans({ subsets: ["latin"] });

// ─── Design tokens ────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreConfig(score: number) {
  if (score >= 70) return { bg: L.greenBg, text: L.greenText, barColor: L.green, label: "Conforme" };
  if (score >= 40) return { bg: L.amberBg, text: L.amberText, barColor: L.amber, label: "Risque modéré" };
  return { bg: L.redBg, text: L.redText, barColor: L.red, label: "Risque élevé" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Carte analyse ────────────────────────────────────────────────────────────

function AnalyseCard({ a }: { a: ComplianceAnalyse }) {
  const [open, setOpen] = useState(false);
  const cfg = scoreConfig(a.score);

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: open ? `1px solid ${L.borderSub}` : "none",
          cursor: "pointer", gap: "12px",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "6px", flexShrink: 0,
            background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
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
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: cfg.text, lineHeight: 1 }}>{a.score}</div>
            <div style={{ fontSize: "10px", color: L.textMuted }}>/ 100</div>
          </div>
          <span style={pill(cfg.bg, cfg.text)}>{cfg.label}</span>
          <span style={{
            fontSize: "12px", color: L.textMuted,
            transform: open ? "rotate(180deg)" : "none",
            display: "inline-block", transition: "transform 0.15s",
          }}>▾</span>
        </div>
      </div>

      {/* Barre de score */}
      <div style={{ height: "3px", background: L.border }}>
        <div style={{
          height: "100%", width: `${Math.max(a.score, 2)}%`,
          background: cfg.barColor, transition: "width 0.4s ease",
        }} />
      </div>

      {/* Panneau déplié */}
      {open && (
        <div style={{
          padding: "16px", display: "flex", flexDirection: "column", gap: "16px",
          background: L.bgPage, borderTop: `1px solid ${L.border}`,
        }}>
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

          {a.actions?.length > 0 && (
            <div>
              <div style={{ ...sectionLabel, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={11} color={L.green} /> Actions correctives ({a.actions.length})
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
                {a.actions.map((ac, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: L.textSec }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: L.green, flexShrink: 0, marginTop: "5px" }} />
                    {ac}
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

// ─── Modal import ─────────────────────────────────────────────────────────────

interface ImportModalProps {
  onClose: () => void;
  onSuccess: (analyse: ComplianceAnalyse) => void;
}

function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [file, setFile]           = useState<File | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = ".pdf,.docx,.txt";

  const handleFile = (f: File) => {
    setErr(null);
    const ok = f.name.match(/\.(pdf|docx|txt)$/i);
    if (!ok) { setErr("Format non supporté. Utilisez PDF, DOCX ou TXT."); return; }
    if (f.size > 10 * 1024 * 1024) { setErr("Fichier trop volumineux (max 10 Mo)."); return; }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/compliance/analyze", { method: "POST", body: fd });
      const json = await res.json() as ComplianceAnalyse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erreur serveur");
      onSuccess(json);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.4)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: L.bgCard, borderRadius: "12px", width: "100%", maxWidth: "480px",
        border: `1px solid ${L.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
      }}>
        {/* Header modal */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", borderBottom: `1px solid ${L.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "7px", background: L.blueBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Upload size={15} color={L.blue} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: L.text }}>Importer un document</div>
              <div style={{ fontSize: "11px", color: L.textMuted }}>PDF, DOCX ou TXT · max 10 Mo</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: "6px", background: "none",
              border: `1px solid ${L.border}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: L.textSec,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Zone drop */}
        <div style={{ padding: "20px" }}>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? L.blue : file ? L.green : L.border}`,
              borderRadius: "10px",
              background: dragging ? L.blueBg : file ? L.greenBg : L.bgMuted,
              padding: "32px 20px",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "10px", cursor: "pointer", transition: "all 0.15s",
              textAlign: "center",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {file ? (
              <>
                <FileText size={28} color={L.green} />
                <div style={{ fontSize: "13px", fontWeight: 600, color: L.text }}>{file.name}</div>
                <div style={{ fontSize: "11px", color: L.textMuted }}>
                  {(file.size / 1024).toFixed(0)} Ko · Cliquez pour changer
                </div>
              </>
            ) : (
              <>
                <Upload size={28} color={L.textMuted} />
                <div style={{ fontSize: "13px", fontWeight: 600, color: L.text }}>
                  Glissez votre document ici
                </div>
                <div style={{ fontSize: "12px", color: L.textMuted }}>
                  ou cliquez pour sélectionner
                </div>
              </>
            )}
          </div>

          {err && (
            <div style={{
              marginTop: "12px", padding: "10px 12px", borderRadius: "7px",
              background: L.redBg, border: `1px solid #FECACA`,
              fontSize: "12px", color: L.redText,
            }}>
              {err}
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: "38px", borderRadius: "7px",
                background: "none", border: `1px solid ${L.border}`,
                fontSize: "13px", fontWeight: 500, color: L.textSec, cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={!file || uploading}
              style={{
                flex: 2, height: "38px", borderRadius: "7px",
                background: !file || uploading ? L.bgMuted : L.blue,
                border: "none",
                fontSize: "13px", fontWeight: 600,
                color: !file || uploading ? L.textMuted : "#FFFFFF",
                cursor: !file || uploading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                transition: "background 0.15s",
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Analyse en cours…
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  Analyser le document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ConformitePage() {
  const [analyses,     setAnalyses]     = useState<ComplianceAnalyse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [showImport,   setShowImport]   = useState(false);

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

  const onImportSuccess = (a: ComplianceAnalyse) => {
    setAnalyses((prev) => [a, ...prev]);
  };

  // Export CSV
  const exportCSV = () => {
    const header = ["ID", "Nom document", "Score", "Statut", "Type", "Date"];
    const rows = analyses.map((a) => [
      a.id,
      `"${a.nom_document.replace(/"/g, '""')}"`,
      a.score,
      a.statut,
      a.type,
      formatDate(a.created_at),
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conformite-rgpd-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nbRisque  = analyses.filter((a) => a.statut === "risque_eleve" || a.statut === "risk").length;
  const scoresMoy = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length)
    : 0;

  return (
    <div className={dmSans.className} style={{ background: L.bgPage, minHeight: "100vh", color: L.text, fontSize: "14px" }}>

      {/* ── Header sticky ──────────────────────────────────────────────────────── */}
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

      {/* ── Contenu ─────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Titre + actions */}
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
              { label: "Documents analysés", val: analyses.length,      iconBg: L.blueBg,                  iconColor: L.blue,                 sub: "dans la base" },
              { label: "Score moyen",        val: `${scoresMoy}/100`,   iconBg: scoreConfig(scoresMoy).bg, iconColor: scoreConfig(scoresMoy).text, sub: "conformité RGPD" },
              { label: "À risque élevé",     val: nbRisque,             iconBg: L.redBg,                   iconColor: L.red,                  sub: "nécessitent action" },
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
            padding: "12px 16px", borderBottom: `1px solid ${L.borderSub}`, gap: "10px",
          }}>
            <div style={{ ...sectionLabel, display: "flex", alignItems: "center", gap: "7px" }}>
              <FileWarning size={14} color={L.textMuted} />
              Analyses de conformité RGPD
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!loading && analyses.length > 0 && (
                <>
                  <span style={pill(L.blueBg, L.blueText)}>{analyses.length} document{analyses.length > 1 ? "s" : ""}</span>
                  <button
                    onClick={exportCSV}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      height: "30px", padding: "0 12px", borderRadius: "6px",
                      background: "none", border: `1px solid ${L.border}`,
                      fontSize: "12px", fontWeight: 500, color: L.textSec, cursor: "pointer",
                    }}
                  >
                    <Download size={12} /> Exporter CSV
                  </button>
                </>
              )}
              <button
                onClick={() => setShowImport(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  height: "30px", padding: "0 12px", borderRadius: "6px",
                  background: L.blue, border: "none",
                  fontSize: "12px", fontWeight: 600, color: "#FFFFFF", cursor: "pointer",
                }}
              >
                <Upload size={12} /> Importer
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: L.textMuted }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "13px" }}>Chargement des analyses…</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Erreur */}
          {!loading && error && (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ ...pill(L.redBg, L.redText), margin: "0 auto 12px", display: "inline-flex" }}>
                Erreur de connexion
              </div>
              <p style={{ fontSize: "13px", color: L.textSec }}>{error}</p>
            </div>
          )}

          {/* Vide */}
          {!loading && !error && analyses.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "10px", background: L.bgMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={22} color={L.textMuted} />
              </div>
              <p style={{ fontSize: "13px", color: L.textMuted, margin: 0 }}>
                Aucune analyse disponible.<br />Importez votre premier document RGPD.
              </p>
              <button
                onClick={() => setShowImport(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  height: "34px", padding: "0 16px", borderRadius: "7px",
                  background: L.blue, border: "none",
                  fontSize: "13px", fontWeight: 600, color: "#FFFFFF", cursor: "pointer",
                }}
              >
                <Upload size={13} /> Importer un document
              </button>
            </div>
          )}

          {/* Liste */}
          {!loading && !error && analyses.length > 0 && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {analyses.map((a) => <AnalyseCard key={a.id} a={a} />)}
            </div>
          )}
        </div>

        {/* Note technique */}
        <div style={{
          padding: "12px 16px", borderRadius: "8px",
          background: L.blueBg, border: "1px solid #BFDBFE",
          fontSize: "12px", color: "#1E40AF", lineHeight: 1.6,
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>
            Les données affichées excluent le contenu brut des documents (RGPD).
            Seuls le score, les risques détectés et les actions correctives sont transmis via la fonction{" "}
            <code style={{ margin: "0 4px", padding: "1px 5px", borderRadius: "3px", background: "#DBEAFE", fontFamily: "monospace" }}>
              get_analyses_safe()
            </code>
            du projet <strong>compliance-rgpd</strong>.
          </span>
        </div>
      </div>

      {/* Modal import */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={onImportSuccess}
        />
      )}
    </div>
  );
}
