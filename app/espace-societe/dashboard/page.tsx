"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users, AlertTriangle, Building2, Bell, Bot,
  FileText, Table2, Phone, CheckCircle2, XCircle,
  Activity, MapPin, Zap, ArrowLeft,
} from "lucide-react";

const BoutonRapportMensuel = dynamic(
  () => import("@/components/dashboard/BoutonRapportMensuel"),
  { ssr: false }
);

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

type AgentStatus = "en_poste" | "anomalie" | "disponible" | "repos";
type SiteStatus  = "nominal"  | "alerte"   | "critique";
type AlertLevel  = "info"     | "warning"  | "critical";

interface Agent {
  id: string; nom: string; prenom: string; site: string;
  horaires: string; tel: string; status: AgentStatus; habilitation: string;
}
interface Anomalie {
  agentId: string; nom: string; prenom: string;
  site: string; tel: string; motif: string; heure: string;
}
interface Site {
  id: string; nom: string; ville: string;
  requis: number; presents: number; status: SiteStatus;
}
interface Alerte {
  id: string; level: AlertLevel; message: string; time: string;
}
interface IASuggestion {
  id: string; site: string; agentManquant: string;
  agentPropose: Agent; confidence: "haute" | "moyenne"; raison: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES MOCK — à remplacer par appels API
// ══════════════════════════════════════════════════════════════════════════════

// TODO: remplacer par les vraies valeurs de la session auth société
const MOCK_SOCIETE = { id: "00000000-0000-0000-0000-000000000000", nom: "Ma Société" };

const AGENTS: Agent[] = [
  { id:"a1", nom:"MARTIN",  prenom:"Luc",       site:"Gare Part-Dieu",      horaires:"06:00-14:00", tel:"0612345678", status:"en_poste",   habilitation:"TFP APS" },
  { id:"a2", nom:"DIALLO",  prenom:"Mamadou",   site:"Centre Commercial A", horaires:"14:00-22:00", tel:"0623456789", status:"anomalie",   habilitation:"TFP APS" },
  { id:"a3", nom:"NGUYEN",  prenom:"Hoa",        site:"Hôpital Nord",        horaires:"22:00-06:00", tel:"0634567890", status:"en_poste",   habilitation:"TFP APS + HOBO" },
  { id:"a4", nom:"LAMBERT", prenom:"Sophie",     site:"Bureau Préfecture",   horaires:"08:00-20:00", tel:"0645678901", status:"anomalie",   habilitation:"TFP APS" },
  { id:"a5", nom:"BENALI",  prenom:"Karim",      site:"Entrepôt Meyzieu",    horaires:"06:00-14:00", tel:"0656789012", status:"en_poste",   habilitation:"TFP APS" },
  { id:"a6", nom:"DUPONT",  prenom:"Jean",       site:"",                    horaires:"—",            tel:"0667890123", status:"disponible", habilitation:"TFP APS" },
  { id:"a7", nom:"KONÉ",    prenom:"Aïssatou",   site:"",                    horaires:"—",            tel:"0678901234", status:"disponible", habilitation:"TFP APS + HOBO" },
  { id:"a8", nom:"FERREIRA",prenom:"Pedro",      site:"Gare Part-Dieu",      horaires:"14:00-22:00", tel:"0689012345", status:"repos",      habilitation:"TFP APS" },
];

const ANOMALIES: Anomalie[] = [
  { agentId:"a2", nom:"DIALLO",  prenom:"Mamadou", site:"Centre Commercial A", tel:"0623456789", motif:"Non badgé à la prise de poste", heure:"14:02" },
  { agentId:"a4", nom:"LAMBERT", prenom:"Sophie",   site:"Bureau Préfecture",   tel:"0645678901", motif:"Absence non justifiée",          heure:"07:58" },
];

const SITES: Site[] = [
  { id:"s1", nom:"Gare Part-Dieu",      ville:"Lyon 3e",     requis:3, presents:2, status:"alerte"   },
  { id:"s2", nom:"Centre Commercial A", ville:"Villeurbanne", requis:2, presents:1, status:"critique" },
  { id:"s3", nom:"Hôpital Nord",        ville:"Lyon 4e",     requis:2, presents:2, status:"nominal"  },
  { id:"s4", nom:"Bureau Préfecture",   ville:"Lyon 2e",     requis:2, presents:1, status:"critique" },
  { id:"s5", nom:"Entrepôt Meyzieu",    ville:"Meyzieu",     requis:1, presents:1, status:"nominal"  },
];

const ALERTES: Alerte[] = [
  { id:"al1", level:"critical", message:"Non badgé à la prise de poste — DIALLO · Centre Commercial A",  time:"14:02" },
  { id:"al2", level:"critical", message:"Absence non justifiée — LAMBERT · Bureau Préfecture",            time:"07:58" },
  { id:"al3", level:"warning",  message:"Effectif incomplet (2/3) — Gare Part-Dieu",                      time:"06:05" },
  { id:"al4", level:"info",     message:"Renouvellement CNAPS requis — MARTIN Luc · échéance dans 30 j",  time:"08:00" },
];

// ══════════════════════════════════════════════════════════════════════════════
// IA OBSERVATEUR — logique de suggestion de remplacement
// ══════════════════════════════════════════════════════════════════════════════

function genererSuggestions(anomalies: Anomalie[], agents: Agent[]): IASuggestion[] {
  const disponibles = agents.filter(a => a.status === "disponible");
  return anomalies
    .map((an, i): IASuggestion | null => {
      const remplacant = disponibles[i % Math.max(disponibles.length, 1)];
      if (!remplacant) return null;
      return {
        id: `sug-${an.agentId}`,
        site: an.site,
        agentManquant: `${an.prenom} ${an.nom}`,
        agentPropose: remplacant,
        confidence: disponibles.length >= 2 ? "haute" : "moyenne",
        raison: `Disponible · Habilitation valide · Zone compatible`,
      };
    })
    .filter((s): s is IASuggestion => s !== null);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS — imports dynamiques (client uniquement)
// ══════════════════════════════════════════════════════════════════════════════

async function exportPDF(agents: Agent[]) {
  try {
    const { default: jsPDF }    = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    const now = new Date();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SecuPRO — Plannings du jour", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Exporté le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      14, 25,
    );
    autoTable(doc, {
      startY: 30,
      head: [["Nom", "Prénom", "Site", "Horaires", "Statut", "Habilitation"]],
      body: agents.filter(a => a.status !== "repos").map(a => [
        a.nom, a.prenom, a.site || "—", a.horaires,
        a.status.replace("_", " ").toUpperCase(), a.habilitation,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [0, 77, 153] },
    });
    doc.save(`secupro-plannings-${now.toISOString().slice(0, 10)}.pdf`);
  } catch (e) {
    console.error("Export PDF :", e);
  }
}

async function exportXLSX(agents: Agent[]) {
  try {
    const XLSX = await import("xlsx");
    const rows = agents.filter(a => a.status !== "repos").map(a => ({
      "Nom": a.nom, "Prénom": a.prenom, "Site": a.site || "—",
      "Horaires": a.horaires, "Téléphone": a.tel,
      "Statut": a.status.replace("_", " ").toUpperCase(),
      "Habilitation": a.habilitation,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plannings");
    XLSX.writeFile(wb, `secupro-plannings-${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e) {
    console.error("Export XLSX :", e);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TOKENS DE DESIGN
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  cyan:       "#00d1ff",
  green:      "#34d399",
  red:        "#f87171",
  amber:      "#fbbf24",
  blue:       "#60a5fa",
  violet:     "#a78bfa",
  indigo:     "#818cf8",
  blockBg:    "rgba(10, 20, 44, 0.8)",
  blockBdr:   "rgba(0, 209, 255, 0.1)",
  rowDivider: "rgba(255,255,255,0.04)",
  muted:      "rgba(148,163,184,0.55)",
};

const STATUS_DOT: Record<string, string> = {
  en_poste:"#34d399", disponible:"#60a5fa", anomalie:"#f87171", repos:"rgba(148,163,184,0.3)",
  nominal:"#34d399",  alerte:"#fbbf24",     critique:"#f87171",
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS PARTAGÉS
// ══════════════════════════════════════════════════════════════════════════════

function Dot({ k }: { k: string }) {
  const color = STATUS_DOT[k] ?? "#94a3b8";
  return (
    <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: color, boxShadow: color.startsWith("rgba") ? "none" : `0 0 5px ${color}` }} />
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[7px] font-black uppercase tracking-[0.22em] px-1.5 py-0.5 rounded-full"
      style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}>
      {label}
    </span>
  );
}

function BlockWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-0 rounded-xl ${className}`}
      style={{ background: C.blockBg, backdropFilter: "blur(14px)", border: `1px solid ${C.blockBdr}` }}>
      {children}
    </div>
  );
}

function BlockHead({
  title, Icon, accent = C.cyan, badge,
  onPDF, onXLSX,
}: {
  title: string; Icon: React.ElementType; accent?: string;
  badge?: { label: string; color: string };
  onPDF?: () => void; onXLSX?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-3.5 pb-3"
      style={{ borderBottom: `1px solid ${accent}14` }}>
      <div className="flex items-center gap-2">
        <Icon size={11} style={{ color: accent }} />
        <span className="text-[9px] font-black uppercase tracking-[0.38em]" style={{ color: accent }}>
          {title}
        </span>
        {badge && <Badge label={badge.label} color={badge.color} />}
      </div>
      {(onPDF || onXLSX) && (
        <div className="flex items-center gap-0.5">
          {onPDF && (
            <button onClick={onPDF} title="Export PDF"
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.4)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.red)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
              <FileText size={11} />
              <span className="text-[8px] font-bold uppercase tracking-wider">PDF</span>
            </button>
          )}
          {onXLSX && (
            <button onClick={onXLSX} title="Export Excel"
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.4)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.green)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
              <Table2 size={11} />
              <span className="text-[8px] font-bold uppercase tracking-wider">XLSX</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 1 — VUE OPÉRATIONNELLE (KPIs)
// ══════════════════════════════════════════════════════════════════════════════

function BlocKPIs({ agents, anomalies }: { agents: Agent[]; anomalies: Anomalie[] }) {
  const kpis = [
    { label: "Total agents",  value: agents.length,                                    color: C.cyan,  sub: "inscrits" },
    { label: "En poste",      value: agents.filter(a => a.status === "en_poste").length,  color: C.green, sub: "actifs" },
    { label: "Anomalies",     value: anomalies.length,                                  color: anomalies.length ? C.red : C.green, sub: "pointage" },
    { label: "Disponibles",   value: agents.filter(a => a.status === "disponible").length, color: C.blue,  sub: "mobilisables" },
  ];
  return (
    <BlockWrap>
      <BlockHead title="Vue opérationnelle" Icon={Activity} />
      <div className="grid grid-cols-2 gap-2 p-3">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5"
            style={{ background: `${k.color}08`, border: `1px solid ${k.color}18` }}>
            <span className="text-[28px] font-black leading-none tabular-nums"
              style={{ color: k.color, textShadow: `0 0 14px ${k.color}55` }}>
              {k.value}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(241,245,249,0.75)" }}>
              {k.label}
            </span>
            <span className="text-[8px] font-medium" style={{ color: C.muted }}>{k.sub}</span>
          </div>
        ))}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 2 — PLANNINGS DU JOUR (export PDF + XLSX)
// ══════════════════════════════════════════════════════════════════════════════

function BlocPlannings({ agents }: { agents: Agent[] }) {
  const actifs = agents.filter(a => a.status !== "repos");
  return (
    <BlockWrap>
      <BlockHead title="Plannings du jour" Icon={Users}
        badge={{ label: `${actifs.length} agents`, color: C.cyan }}
        onPDF={() => exportPDF(agents)} onXLSX={() => exportXLSX(agents)} />
      <div className="px-4 pb-3 pt-1">
        {/* En-têtes */}
        <div className="grid text-[8px] font-black uppercase tracking-[0.3em] pb-1.5"
          style={{ gridTemplateColumns: "2fr 2fr 1.2fr 0.5fr", color: "rgba(0,209,255,0.38)",
            borderBottom: "1px solid rgba(0,209,255,0.08)" }}>
          <span>Agent</span><span>Site</span><span>Horaires</span><span>St.</span>
        </div>
        {/* Lignes */}
        {actifs.map((a, i) => (
          <div key={a.id} className="grid items-center py-1.5"
            style={{ gridTemplateColumns: "2fr 2fr 1.2fr 0.5fr",
              borderBottom: i < actifs.length - 1 ? `1px solid ${C.rowDivider}` : "none" }}>
            <span className="text-[11px] font-semibold truncate pr-2" style={{ color: "rgba(241,245,249,0.85)" }}>
              {a.prenom} {a.nom}
            </span>
            <span className="text-[10px] truncate pr-2" style={{ color: C.muted }}>
              {a.site || "—"}
            </span>
            <span className="text-[10px] font-mono" style={{ color: "rgba(0,209,255,0.6)" }}>
              {a.horaires}
            </span>
            <Dot k={a.status} />
          </div>
        ))}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 3 — ANOMALIES DE POINTAGE
// ══════════════════════════════════════════════════════════════════════════════

function BlocAnomalies({ anomalies }: { anomalies: Anomalie[] }) {
  const accent = anomalies.length > 0 ? C.red : C.green;
  return (
    <BlockWrap>
      <BlockHead title="Anomalies pointage" Icon={AlertTriangle} accent={accent}
        badge={anomalies.length > 0 ? { label: `${anomalies.length} alerte${anomalies.length > 1 ? "s" : ""}`, color: C.red } : undefined} />
      <div className="px-4 pb-3 pt-1">
        {anomalies.length === 0 ? (
          <div className="flex items-center gap-2 py-2">
            <CheckCircle2 size={13} style={{ color: C.green }} />
            <span className="text-[11px] font-semibold" style={{ color: C.green }}>
              Aucune anomalie · Opérations fluides
            </span>
          </div>
        ) : (
          <>
            <div className="grid text-[8px] font-black uppercase tracking-[0.3em] pb-1.5"
              style={{ gridTemplateColumns: "1.6fr 1.5fr 1fr", color: "rgba(248,113,113,0.45)",
                borderBottom: "1px solid rgba(248,113,113,0.1)" }}>
              <span>Site</span><span>Agent</span><span>Tél</span>
            </div>
            {anomalies.map((a, i) => (
              <div key={a.agentId} className="grid items-center py-2"
                style={{ gridTemplateColumns: "1.6fr 1.5fr 1fr",
                  borderBottom: i < anomalies.length - 1 ? `1px solid ${C.rowDivider}` : "none" }}>
                <span className="text-[10px] truncate pr-1" style={{ color: "rgba(248,113,113,0.8)" }}>
                  {a.site}
                </span>
                <span className="text-[11px] font-semibold truncate pr-1" style={{ color: "rgba(241,245,249,0.85)" }}>
                  {a.prenom} {a.nom}
                </span>
                <a href={`tel:${a.tel}`}
                  className="flex items-center gap-1 text-[10px] font-mono transition-colors duration-150"
                  style={{ color: C.cyan }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.green)}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.cyan)}>
                  <Phone size={9} />
                  {a.tel}
                </a>
              </div>
            ))}
          </>
        )}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 4 — SITES ACTIFS
// ══════════════════════════════════════════════════════════════════════════════

const SITE_CFG: Record<SiteStatus, { label: string; color: string }> = {
  nominal:  { label: "OK",       color: C.green },
  alerte:   { label: "ALERTE",   color: C.amber },
  critique: { label: "CRITIQUE", color: C.red   },
};

function BlocSites({ sites }: { sites: Site[] }) {
  return (
    <BlockWrap>
      <BlockHead title="Sites actifs" Icon={Building2} accent={C.violet}
        badge={{ label: `${sites.length} sites`, color: C.violet }} />
      <div className="px-4 pb-3 pt-1 flex flex-col" style={{ gap: 0 }}>
        {sites.map((s, i) => {
          const cfg = SITE_CFG[s.status];
          return (
            <div key={s.id} className="flex items-center justify-between py-2"
              style={{ borderBottom: i < sites.length - 1 ? `1px solid ${C.rowDivider}` : "none" }}>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-semibold truncate" style={{ color: "rgba(241,245,249,0.85)" }}>
                  {s.nom}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin size={8} style={{ color: "rgba(148,163,184,0.35)" }} />
                  <span className="text-[9px]" style={{ color: "rgba(148,163,184,0.4)" }}>{s.ville}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono tabular-nums" style={{ color: "rgba(0,209,255,0.6)" }}>
                  {s.presents}/{s.requis}
                </span>
                <Badge label={cfg.label} color={cfg.color} />
              </div>
            </div>
          );
        })}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 5 — ALERTES & INCIDENTS
// ══════════════════════════════════════════════════════════════════════════════

const ALERT_CFG: Record<AlertLevel, { color: string; Icon: React.ElementType }> = {
  info:     { color: C.blue,  Icon: Bell         },
  warning:  { color: C.amber, Icon: AlertTriangle },
  critical: { color: C.red,   Icon: XCircle      },
};

function BlocAlertes({ alertes }: { alertes: Alerte[] }) {
  const critiques = alertes.filter(a => a.level === "critical").length;
  return (
    <BlockWrap>
      <BlockHead title="Alertes & incidents" Icon={Bell} accent={C.amber}
        badge={critiques > 0 ? { label: `${critiques} critique${critiques > 1 ? "s" : ""}`, color: C.red } : undefined} />
      <div className="px-4 pb-3 pt-1 flex flex-col" style={{ gap: 0 }}>
        {alertes.map((al, i) => {
          const { color, Icon } = ALERT_CFG[al.level];
          return (
            <div key={al.id} className="flex items-start gap-2.5 py-2"
              style={{ borderBottom: i < alertes.length - 1 ? `1px solid ${C.rowDivider}` : "none" }}>
              <Icon size={11} className="mt-0.5 shrink-0" style={{ color }} />
              <span className="text-[10px] font-medium leading-snug flex-1" style={{ color: "rgba(241,245,249,0.72)" }}>
                {al.message}
              </span>
              <span className="text-[9px] font-mono shrink-0" style={{ color: "rgba(148,163,184,0.38)" }}>
                {al.time}
              </span>
            </div>
          );
        })}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOC 6 — IA BUSINESS OBSERVATEUR
// ══════════════════════════════════════════════════════════════════════════════

const CONF_COLOR = { haute: C.green, moyenne: C.amber };

function BlocIA({ suggestions, anomalies }: { suggestions: IASuggestion[]; anomalies: Anomalie[] }) {
  return (
    <BlockWrap>
      <BlockHead title="IA Business — Observateur" Icon={Bot} accent={C.indigo}
        badge={{ label: "ACTIF", color: C.green }} />
      <div className="px-4 pb-3 pt-2 flex flex-col gap-2">

        {/* Analyse contextuelle */}
        <div className="flex items-start gap-2 rounded-lg px-3 py-2.5"
          style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.14)" }}>
          <Bot size={11} className="mt-0.5 shrink-0" style={{ color: C.indigo }} />
          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
            {anomalies.length === 0
              ? "Analyse complète · Aucune intervention requise · Tous les postes sont couverts."
              : `Analyse en cours · ${anomalies.length} absence${anomalies.length > 1 ? "s" : ""} détectée${anomalies.length > 1 ? "s" : ""} · ${suggestions.length} solution${suggestions.length > 1 ? "s" : ""} de remplacement identifiée${suggestions.length > 1 ? "s" : ""}.`
            }
          </p>
        </div>

        {suggestions.length === 0 ? (
          <div className="flex items-center gap-2 py-1">
            <CheckCircle2 size={13} style={{ color: C.green }} />
            <span className="text-[11px] font-semibold" style={{ color: C.green }}>
              Effectifs nominaux · Aucune action requise
            </span>
          </div>
        ) : (
          suggestions.map(sug => (
            <div key={sug.id} className="flex flex-col gap-2 rounded-lg p-3"
              style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.16)" }}>

              {/* En-tête suggestion */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black uppercase tracking-[0.32em]"
                    style={{ color: "rgba(129,140,248,0.55)" }}>{sug.site}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(248,113,113,0.85)" }}>
                    ⚠ {sug.agentManquant} — absent
                  </span>
                </div>
                <Badge label={sug.confidence} color={CONF_COLOR[sug.confidence]} />
              </div>

              {/* Remplacement proposé */}
              <div className="flex items-center justify-between rounded-md px-3 py-2"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.16)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Zap size={10} style={{ color: C.green }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black" style={{ color: C.green }}>
                      {sug.agentPropose.prenom} {sug.agentPropose.nom}
                    </span>
                    <span className="text-[8px] truncate" style={{ color: "rgba(52,211,153,0.55)" }}>
                      {sug.raison}
                    </span>
                  </div>
                </div>
                <a href={`tel:${sug.agentPropose.tel}`}
                  className="flex items-center gap-1 ml-2 shrink-0 rounded-md px-2 py-1 text-[9px] font-mono transition-colors duration-150"
                  style={{ color: C.cyan, background: "rgba(0,209,255,0.06)", border: "1px solid rgba(0,209,255,0.15)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.green)}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.cyan)}>
                  <Phone size={9} /> Appeler
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════

export default function ChefExploitationDashboard() {
  const router = useRouter();

  // État global — source de vérité partagée entre tous les blocs
  const [agents]   = useState<Agent[]>(AGENTS);
  const [anomalies] = useState<Anomalie[]>(ANOMALIES);
  const [sites]    = useState<Site[]>(SITES);
  const [alertes]  = useState<Alerte[]>(ALERTES);

  // IA observe anomalies + agents disponibles → suggestions dérivées
  const suggestions = useMemo(
    () => genererSuggestions(anomalies, agents),
    [anomalies, agents],
  );

  return (
    <div className="relative min-h-screen"
      style={{
        background: "radial-gradient(ellipse 130% 55% at 50% 0%, rgba(0,35,90,0.4) 0%, #0B1426 50%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}>

      {/* Grille de fond */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.018) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 100% 80% at 50% 10%, black, transparent 75%)",
        }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-2.5"
        style={{ background: "rgba(11,20,38,0.93)", backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0,209,255,0.09)" }}>

        <button type="button" onClick={() => router.push("/espace-societe")}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors duration-150"
          style={{ color: "rgba(148,163,184,0.5)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.cyan)}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.5)")}>
          <ArrowLeft size={11} /> Retour
        </button>

        <div className="flex items-center gap-2.5">
          <Image src="/secupro-logo-official.png" alt="SecuPRO" width={26} height={26}
            style={{ filter: "drop-shadow(0 0 7px rgba(0,209,255,0.4))" }} />
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.48em]"
              style={{ color: "rgba(0,209,255,0.4)" }}>SecuPRO Business</p>
            <h1 className="text-[13px] font-black leading-none tracking-tight text-white">
              CHEF D&apos;EXPLOITATION
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span className="text-[8px] font-black uppercase tracking-[0.22em]"
            style={{ color: "rgba(52,211,153,0.75)" }}>En direct</span>
        </div>
      </header>

      {/* ── GRILLE 7 BLOCS ── */}
      <main className="px-4 py-4 max-w-[1440px] mx-auto dash-grid">
        <BlocKPIs    agents={agents} anomalies={anomalies} />
        <BlocPlannings agents={agents} />
        <BlocAnomalies anomalies={anomalies} />
        <BlocSites   sites={sites} />
        <BlocAlertes alertes={alertes} />
        <BlocIA      suggestions={suggestions} anomalies={anomalies} />
        <BoutonRapportMensuel
          societeId={MOCK_SOCIETE.id}
          societeName={MOCK_SOCIETE.nom}
        />
      </main>

      <footer className="px-5 py-4 text-center">
        <p className="text-[8px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(0,209,255,0.07)" }}>
          © 2026 SECUPRO BUSINESS · Données simulées · SIRET 10335392600019
        </p>
      </footer>

      {/* Responsive */}
      <style>{`
        .dash-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(3, 1fr);
          align-items: start;
        }
        @media (max-width: 1024px) { .dash-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
