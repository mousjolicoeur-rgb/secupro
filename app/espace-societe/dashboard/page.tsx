"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Users, AlertTriangle, Building2, Bell, Bot,
  FileText, Table2, Phone, CheckCircle2, XCircle,
  Activity, MapPin, Zap, ArrowLeft, Shield, Eye, Clock, Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
interface AgentDoc {
  id: string; nom: string; prenom: string; tel: string;
  carte_pro_num: string;  carte_pro_expiry: string;
  sst_expiry: string | null;
  cqp_expiry: string | null;
  ssiap_level: string | null; ssiap_expiry: string | null;
  online: boolean;
}
interface ContactMessage {
  id: string; agentId: string; agentNom: string;
  content: string; time: string;
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

// Dates calculées dynamiquement par rapport à today pour un rendu réaliste
const T = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

const AGENTS_DOCS: AgentDoc[] = [
  { id:"a1", nom:"MARTIN",   prenom:"Luc",      tel:"0612345678", carte_pro_num:"AUT-069-2024-01-A", carte_pro_expiry:T(45),  sst_expiry:T(120), cqp_expiry:T(200),  ssiap_level:"1", ssiap_expiry:T(90),  online:true  },
  { id:"a2", nom:"DIALLO",   prenom:"Mamadou",  tel:"0623456789", carte_pro_num:"AUT-069-2023-02-B", carte_pro_expiry:T(8),   sst_expiry:T(-5),  cqp_expiry:null,    ssiap_level:null,ssiap_expiry:null,   online:true  },
  { id:"a3", nom:"NGUYEN",   prenom:"Hoa",      tel:"0634567890", carte_pro_num:"AUT-069-2024-03-C", carte_pro_expiry:T(310), sst_expiry:T(200), cqp_expiry:T(420),  ssiap_level:"2", ssiap_expiry:T(400), online:false },
  { id:"a4", nom:"LAMBERT",  prenom:"Sophie",   tel:"0645678901", carte_pro_num:"AUT-069-2024-04-D", carte_pro_expiry:T(22),  sst_expiry:T(18),  cqp_expiry:null,    ssiap_level:null,ssiap_expiry:null,   online:false },
  { id:"a5", nom:"BENALI",   prenom:"Karim",    tel:"0656789012", carte_pro_num:"AUT-069-2023-05-E", carte_pro_expiry:T(180), sst_expiry:T(75),  cqp_expiry:T(180),  ssiap_level:null,ssiap_expiry:null,   online:true  },
  { id:"a6", nom:"DUPONT",   prenom:"Jean",     tel:"0667890123", carte_pro_num:"AUT-069-2024-06-F", carte_pro_expiry:T(600), sst_expiry:T(380), cqp_expiry:T(500),  ssiap_level:"1", ssiap_expiry:T(210), online:true  },
  { id:"a7", nom:"KONÉ",     prenom:"Aïssatou", tel:"0678901234", carte_pro_num:"AUT-069-2024-07-G", carte_pro_expiry:T(500), sst_expiry:T(25),  cqp_expiry:null,    ssiap_level:null,ssiap_expiry:null,   online:false },
  { id:"a8", nom:"FERREIRA", prenom:"Pedro",    tel:"0689012345", carte_pro_num:"AUT-069-2023-08-H", carte_pro_expiry:T(-12), sst_expiry:T(-30), cqp_expiry:T(95),   ssiap_level:null,ssiap_expiry:null,   online:false },
];

const INIT_MESSAGES: ContactMessage[] = [
  { id:"m1", agentId:"a1", agentNom:"MARTIN Luc",     content:"Planning validé pour demain 06h00",                      time:"13:45" },
  { id:"m2", agentId:"a3", agentNom:"NGUYEN Hoa",     content:"Rappel : badge obligatoire à la prise de poste",        time:"12:30" },
  { id:"m3", agentId:"a5", agentNom:"BENALI Karim",   content:"Modification de poste : Entrepôt → Gare Part-Dieu",     time:"10:15" },
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

// ── Badging documents ──────────────────────────────────────────────────────
function docBadge(expiry: string | null): { label: string; color: string; days: number | null } {
  if (!expiry) return { label: "N/R", color: "rgba(148,163,184,0.35)", days: null };
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  if (days < 0)   return { label: "EXPIRÉ",         color: "#f87171", days };
  if (days <= 30) return { label: "EXPIRE BIENTÔT", color: "#fbbf24", days };
  return                  { label: "VALIDE",          color: "#34d399", days };
}

// IA : génère des alertes à partir des docs agents
function genDocAlerts(docs: AgentDoc[]): Alerte[] {
  const out: Alerte[] = [];
  docs.forEach(d => {
    const checks = [
      { label: "Carte pro",            expiry: d.carte_pro_expiry },
      { label: "SST",                  expiry: d.sst_expiry },
      { label: "CQP",                  expiry: d.cqp_expiry },
      { label: `SSIAP ${d.ssiap_level ?? ""}`.trim(), expiry: d.ssiap_expiry },
    ];
    checks.forEach(({ label, expiry }) => {
      if (!expiry) return;
      const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86_400_000);
      if (days < 0) {
        out.push({ id: `doc-${d.id}-${label}`, level: "critical",
          message: `SecuIA — ${label} EXPIRÉ · ${d.prenom} ${d.nom}`, time: "IA" });
      } else if (days <= 30) {
        out.push({ id: `doc-${d.id}-${label}`, level: "warning",
          message: `SecuIA — ${label} expire J-${days} · ${d.prenom} ${d.nom}`, time: "IA" });
      }
    });
  });
  return out;
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

function normCell(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function parseStatutPlanning(raw: string): AgentStatus {
  const t = raw.trim().toLowerCase();
  if (t.includes("repos")) return "repos";
  if (t.includes("dispo")) return "disponible";
  if (t.includes("anomal")) return "anomalie";
  if (t.includes("poste") || t === "actif" || t === "en poste" || t === "en_poste") return "en_poste";
  return "en_poste";
}

/** Importe planning depuis .xlsx / .xls / .csv — colonnes Agent, Site, Horaires, Statut */
async function parsePlanningFromFile(file: File): Promise<Agent[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error("empty");
  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(ws, {
    header: 1,
    raw: false,
    defval: "",
  }) as (string | number | undefined)[][];

  let headerRow = -1;
  let colAgent = -1;
  let colSite = -1;
  let colHoraires = -1;
  let colStatut = -1;

  for (let r = 0; r < Math.min(rows.length, 40); r++) {
    const row = rows[r] ?? [];
    const cells = row.map(normCell);
    const ia = cells.findIndex(c => c === "agent");
    const is = cells.findIndex(c => c === "site");
    const ih = cells.findIndex(c => c === "horaires" || c === "horaire");
    const ist = cells.findIndex(c => c === "statut" || c === "status" || c === "st");
    if (ia >= 0 && is >= 0 && ih >= 0 && ist >= 0) {
      headerRow = r;
      colAgent = ia;
      colSite = is;
      colHoraires = ih;
      colStatut = ist;
      break;
    }
  }

  if (headerRow < 0) throw new Error("format");

  const out: Agent[] = [];
  let idx = 0;
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const agentStr = String(row[colAgent] ?? "").trim();
    const site = String(row[colSite] ?? "").trim();
    const horaires = String(row[colHoraires] ?? "").trim();
    const statutRaw = String(row[colStatut] ?? "").trim();
    if (!agentStr && !site && !horaires && !statutRaw) continue;
    if (!agentStr) continue;

    const parts = agentStr.split(/\s+/).filter(Boolean);
    const prenom = parts[0] ?? "—";
    const nom = parts.slice(1).join(" ").trim() || "—";

    out.push({
      id: `imp-${idx++}`,
      nom,
      prenom,
      site,
      horaires: horaires || "—",
      tel: "—",
      status: parseStatutPlanning(statutRaw),
      habilitation: "TFP APS",
    });
  }

  if (out.length === 0) throw new Error("format");
  return out;
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

// ── Données conformité CNAPS ─────────────────────────────────────────────────
type CnapsStatut = "conforme" | "a_verifier" | "critique";
interface CnapsModule {
  num: string; titre: string; statut: CnapsStatut;
  solution: string; lien: string;
}
const CNAPS_MODULES: CnapsModule[] = [
  { num:"01", titre:"Exercice sans carte professionnelle valide",      statut:"critique",   solution:"Alertes expiration carte pro automatiques (CNAPS)",        lien:"#agents" },
  { num:"02", titre:"Défaut d'habilitation préalable du dirigeant",    statut:"a_verifier", solution:"Suivi habilitation dirigeant avec rappels",                lien:"/espace-societe/support" },
  { num:"03", titre:"Emploi d'agents non titulaires du TFP APS",       statut:"critique",   solution:"Vérification TFP APS à l'import CSV agents",              lien:"#agents" },
  { num:"04", titre:"Absence du livre de police (registre d'activité)",statut:"a_verifier", solution:"Registre d'activité généré automatiquement",              lien:"#planning" },
  { num:"05", titre:"Défaut d'assurance RCP",                           statut:"a_verifier", solution:"Document RCP centralisé avec alerte échéance",            lien:"/espace-societe/support" },
  { num:"06", titre:"Non-respect de la tenue réglementaire",            statut:"conforme",   solution:"Checklist tenue par agent au pointage",                   lien:"#planning" },
  { num:"07", titre:"Sous-traitance à une entreprise non autorisée",    statut:"a_verifier", solution:"Vérification autorisation CNAPS sous-traitants",          lien:"/espace-societe/support" },
  { num:"08", titre:"Dépassement des plafonds horaires légaux",         statut:"conforme",   solution:"Détection automatique dépassement 48h/semaine",           lien:"#alertes" },
  { num:"09", titre:"Absence du DUERP",                                 statut:"a_verifier", solution:"Modèle DUERP générable depuis la plateforme",             lien:"/espace-societe/support" },
  { num:"10", titre:"Défaut de formation continue obligatoire",         statut:"conforme",   solution:"Suivi formations SST/SSIAP/recyclage par agent",          lien:"#agents" },
];
const CNAPS_STATUT_CFG: Record<CnapsStatut, { label: string; color: string }> = {
  conforme:   { label: "Conforme",   color: "#34d399" },
  a_verifier: { label: "À vérifier", color: "#fbbf24" },
  critique:   { label: "Critique",   color: "#f87171" },
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

function CnapsCard({ num, titre, statut, solution, lien }: CnapsModule) {
  const router = useRouter();
  const cfg = CNAPS_STATUT_CFG[statut];

  const handleVoir = () => {
    if (lien.startsWith("#")) {
      // Scroll fluide vers la section cible sur la même page
      const el = document.getElementById(lien.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(lien);
    }
  };
  return (
    <div
      style={{
        background: "rgba(8,16,34,0.85)",
        border: `1px solid ${cfg.color}22`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontFamily: "'Rajdhani', monospace",
            fontSize: "11px",
            fontWeight: 900,
            color: cfg.color,
            opacity: 0.7,
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}>
            {num}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.35 }}>
            {titre}
          </span>
        </div>
        <span style={{
          fontSize: "7px", fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.2em", padding: "3px 8px", borderRadius: "99px", flexShrink: 0,
          background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, color: cfg.color,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Solution */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
        <span style={{ fontSize: "9px", color: C.cyan, flexShrink: 0, marginTop: "1px" }}>✓</span>
        <p style={{ fontSize: "11px", color: C.muted, lineHeight: 1.5 }}>
          <span style={{ color: "rgba(0,209,255,0.45)", fontSize: "9px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em", marginRight: "5px" }}>
            Solution :
          </span>
          {solution}
        </p>
      </div>

      {/* Bouton */}
      <div>
        <button
          onClick={handleVoir}
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: cfg.color,
            padding: "4px 10px", borderRadius: "6px",
            background: `${cfg.color}0d`, border: `1px solid ${cfg.color}22`,
            cursor: "pointer", transition: "all 0.18s",
          }}
        >
          <Eye style={{ width: "9px", height: "9px" }} />
          Voir
        </button>
      </div>
    </div>
  );
}

function BlockHead({
  title, Icon, accent = C.cyan, badge,
  onPDF, onXLSX, onImportExcel,
}: {
  title: string; Icon: React.ElementType; accent?: string;
  badge?: { label: string; color: string };
  onPDF?: () => void; onXLSX?: () => void;
  onImportExcel?: () => void;
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
      {(onPDF || onXLSX || onImportExcel) && (
        <div className="flex items-center gap-0.5">
          {onPDF && (
            <button onClick={onPDF} title="Export PDF" type="button"
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.4)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.red)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
              <FileText size={11} />
              <span className="text-[8px] font-bold uppercase tracking-wider">PDF</span>
            </button>
          )}
          {onXLSX && (
            <button onClick={onXLSX} title="Export Excel" type="button"
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.4)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.green)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
              <Table2 size={11} />
              <span className="text-[8px] font-bold uppercase tracking-wider">XLSX</span>
            </button>
          )}
          {onImportExcel && (
            <button onClick={onImportExcel} title="Importer Excel / CSV" type="button"
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.4)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.cyan)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.4)")}>
              <span className="text-[10px] leading-none" aria-hidden>📥</span>
              <span className="text-[8px] font-bold uppercase tracking-wider">Importer Excel</span>
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

type ToastState = { message: string; variant: "ok" | "err" } | null;

function BlocPlannings({
  agents,
  onAgentsImported,
}: {
  agents: Agent[];
  onAgentsImported: (next: Agent[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const actifs = agents.filter(a => a.status !== "repos");

  const openFilePicker = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const next = await parsePlanningFromFile(file);
      onAgentsImported(next);
      setToast({ message: `Planning importé — ${next.length} agent${next.length > 1 ? "s" : ""} chargé${next.length > 1 ? "s" : ""}`, variant: "ok" });
    } catch {
      setToast({ message: "Format invalide", variant: "err" });
    }
  };

  return (
    <BlockWrap>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        aria-hidden
        onChange={onFileChange}
      />
      <BlockHead title="Plannings du jour" Icon={Users}
        badge={{ label: `${actifs.length} agents`, color: C.cyan }}
        onPDF={() => exportPDF(agents)}
        onXLSX={() => exportXLSX(agents)}
        onImportExcel={openFilePicker}
      />
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
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4 py-3 rounded-xl text-[11px] font-semibold shadow-lg max-w-[90vw]"
          style={{
            background: toast.variant === "ok" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            border: `1px solid ${toast.variant === "ok" ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.4)"}`,
            color: toast.variant === "ok" ? "#34d399" : "#f87171",
            backdropFilter: "blur(12px)",
          }}
          role="status"
        >
          {toast.message}
        </div>
      )}
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

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1 — EFFECTIFS & CONFORMITÉ DOCUMENTS
// ══════════════════════════════════════════════════════════════════════════════

function DocBadge({ expiry }: { expiry: string | null }) {
  const { label, color, days } = docBadge(expiry);
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: `${color}12`, border: `1px solid ${color}30`, fontSize: "8px",
        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color }}>
      {label}
      {days !== null && days >= 0 && days <= 30 && (
        <span style={{ opacity: 0.65 }}>J-{days}</span>
      )}
    </span>
  );
}

function BlocAgentsDocuments({ docs }: { docs: AgentDoc[] }) {
  return (
    <BlockWrap>
      <BlockHead title="Effectifs & Conformité Documents" Icon={FileText}
        badge={{ label: `${docs.length} agents`, color: C.cyan }} />
      <div style={{ overflowX: "auto", padding: "0 0 4px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.blockBdr}` }}>
              {["Agent", "Tél.", "Carte Pro", "SST", "CQP", "SSIAP"].map(h => (
                <th key={h} style={{ padding: "6px 12px", textAlign: "left",
                  color: "rgba(0,209,255,0.45)", fontWeight: 700,
                  fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.3em",
                  whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={d.id}
                style={{ borderBottom: i < docs.length - 1 ? `1px solid ${C.rowDivider}` : "none" }}>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700, color: "#f1f5f9" }}>
                    {d.prenom} {d.nom}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", color: C.muted, whiteSpace: "nowrap" }}>
                  {d.tel}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: "8px", color: C.muted, fontFamily: "monospace" }}>
                      {d.carte_pro_num}
                    </span>
                    <DocBadge expiry={d.carte_pro_expiry} />
                  </div>
                </td>
                <td style={{ padding: "8px 12px" }}><DocBadge expiry={d.sst_expiry} /></td>
                <td style={{ padding: "8px 12px" }}><DocBadge expiry={d.cqp_expiry} /></td>
                <td style={{ padding: "8px 12px" }}>
                  {d.ssiap_expiry ? (
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "8px", color: C.violet, fontWeight: 700 }}>
                        Niv.{d.ssiap_level}
                      </span>
                      <DocBadge expiry={d.ssiap_expiry} />
                    </div>
                  ) : (
                    <span style={{ fontSize: "9px", color: "rgba(148,163,184,0.3)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockWrap>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2 — PORTAIL CONTACT AGENTS LIVE
// ══════════════════════════════════════════════════════════════════════════════

function BlocPortailContact({
  docs,
  messages,
  onSend,
}: {
  docs: AgentDoc[];
  messages: ContactMessage[];
  onSend: (agentId: string, agentNom: string, content: string) => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState<AgentDoc | null>(null);
  const [msgText, setMsgText]             = useState("");
  const [sending, setSending]             = useState(false);

  const handleSend = async () => {
    if (!selectedAgent || !msgText.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 280));
    onSend(selectedAgent.id, `${selectedAgent.prenom} ${selectedAgent.nom}`, msgText.trim());
    setMsgText("");
    setSending(false);
  };

  const online  = docs.filter(d => d.online);
  const offline = docs.filter(d => !d.online);

  return (
    <BlockWrap>
      {/* En-tête */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${C.blockBdr}` }}>
        <div className="flex items-center gap-2">
          <Phone className="shrink-0" style={{ width: "13px", height: "13px", color: C.cyan }} />
          <span className="text-[9px] font-black uppercase tracking-[0.22em]"
            style={{ color: C.muted }}>Canal direct agents</span>
          <span className="text-[9px] font-black uppercase tracking-[0.22em]"
            style={{ color: C.cyan }}>— En direct</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: C.green, boxShadow: `0 0 5px ${C.green}` }} />
          <span className="text-[8px] font-black uppercase tracking-[0.22em]"
            style={{ color: "rgba(52,211,153,0.75)" }}>
            {online.length} en ligne
          </span>
        </div>
      </div>

      <div
        className="grid gap-0 portail-grid"
        style={{ gridTemplateColumns: "1fr 1fr", minHeight: "0" }}
      >
        {/* Colonne gauche : liste agents */}
        <div style={{ borderRight: `1px solid ${C.blockBdr}`, padding: "12px 0" }}>
          {[...online, ...offline].map(d => (
            <button key={d.id} type="button"
              onClick={() => setSelectedAgent(d)}
              className="w-full flex items-center gap-2.5 px-4 py-2 transition-all"
              style={{
                background: selectedAgent?.id === d.id ? "rgba(0,209,255,0.06)" : "transparent",
                borderLeft: selectedAgent?.id === d.id ? `2px solid ${C.cyan}` : "2px solid transparent",
                cursor: "pointer", textAlign: "left",
              }}>
              {/* Statut online */}
              <span className="shrink-0 w-2 h-2 rounded-full"
                style={{
                  background: d.online ? C.green : "rgba(148,163,184,0.2)",
                  boxShadow: d.online ? `0 0 5px ${C.green}` : "none",
                }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate" style={{ color: "#f1f5f9" }}>
                  {d.prenom} {d.nom}
                </p>
                <p className="text-[8px] font-medium" style={{ color: C.muted }}>
                  {d.online ? "En ligne" : "Hors ligne"} · {d.tel}
                </p>
              </div>
              {/* Bouton appel */}
              <a href={`tel:${d.tel}`}
                onClick={e => e.stopPropagation()}
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg transition-all"
                style={{ background: "rgba(52,211,153,0.08)", border: `1px solid ${C.green}22`,
                  color: C.green, textDecoration: "none", fontSize: "9px" }}
                title={`Appeler ${d.prenom}`}>
                📞
              </a>
            </button>
          ))}
        </div>

        {/* Colonne droite : messagerie */}
        <div className="flex flex-col" style={{ padding: "12px" }}>
          {/* Historique messages */}
          <div className="flex-1 flex flex-col gap-2 mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}>
            {messages.length === 0 ? (
              <p className="text-[9px] text-center py-4" style={{ color: C.muted }}>
                Aucun message envoyé
              </p>
            ) : (
              messages.slice(-5).reverse().map(m => (
                <div key={m.id} className="rounded-xl px-3 py-2"
                  style={{ background: "rgba(0,209,255,0.04)", border: `1px solid ${C.blockBdr}` }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]"
                      style={{ color: C.cyan }}>{m.agentNom}</span>
                    <span className="text-[8px]" style={{ color: C.muted }}>{m.time}</span>
                  </div>
                  <p className="text-[10px] leading-snug" style={{ color: "rgba(241,245,249,0.7)" }}>
                    {m.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Zone envoi */}
          <div className="flex flex-col gap-2">
            {selectedAgent ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(0,209,255,0.06)", border: `1px solid ${C.cyan}22` }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: selectedAgent.online ? C.green : "rgba(148,163,184,0.3)" }} />
                <span className="text-[9px] font-black" style={{ color: C.cyan }}>
                  → {selectedAgent.prenom} {selectedAgent.nom}
                </span>
              </div>
            ) : (
              <p className="text-[9px] text-center" style={{ color: C.muted }}>
                Sélectionnez un agent à gauche
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={!selectedAgent}
                placeholder="Message rapide…"
                className="flex-1 rounded-xl px-3 py-2 text-[11px] outline-none"
                style={{
                  background: "rgba(0,209,255,0.04)",
                  border: `1px solid ${C.blockBdr}`,
                  color: "#f1f5f9",
                  opacity: selectedAgent ? 1 : 0.4,
                }}
              />
              <button type="button" onClick={handleSend}
                disabled={!selectedAgent || !msgText.trim() || sending}
                className="rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] transition-all shrink-0"
                style={{
                  background: selectedAgent && msgText.trim() ? C.cyan : "rgba(0,209,255,0.08)",
                  color: selectedAgent && msgText.trim() ? "#0B1426" : "rgba(0,209,255,0.3)",
                  cursor: selectedAgent && msgText.trim() ? "pointer" : "not-allowed",
                  border: "none",
                }}>
                {sending ? "…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BlockWrap>
  );
}

/** Nouveau client : pas d'agents en base — accueil et actions prioritaires */
function OnboardingPanel({
  trialDaysLeft,
  subscriptionActive,
  onAgentsImported,
}: {
  trialDaysLeft: number | null;
  subscriptionActive: boolean;
  onAgentsImported: (next: Agent[]) => void;
}) {
  const router = useRouter();
  const fileRef    = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const next = await parsePlanningFromFile(file);
      onAgentsImported(next);
      setToast({ message: `Planning importé — ${next.length} agent${next.length > 1 ? "s" : ""} chargé${next.length > 1 ? "s" : ""}`, variant: "ok" });
    } catch {
      setToast({ message: "Format invalide", variant: "err" });
    }
  };

  const showTrial = !subscriptionActive && trialDaysLeft !== null;
  const trialColor =
    trialDaysLeft !== null
      ? (trialDaysLeft > 3 ? "#60a5fa" : trialDaysLeft >= 2 ? "#fbbf24" : "#f87171")
      : C.cyan;
  const progressPct =
    trialDaysLeft !== null ? Math.round(((7 - trialDaysLeft) / 7) * 100) : 0;

  const cardStyle = (accent: string) => ({
    background: `${accent}08`,
    border: `1px solid ${accent}25`,
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.2s",
  });

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        aria-hidden
        onChange={onFileChange}
      />

      {/* Message bienvenue */}
      <div className="rounded-2xl px-6 py-8 mb-6 text-center"
        style={{
          background: "rgba(0,209,255,0.05)",
          border: "1px solid rgba(0,209,255,0.14)",
          boxShadow: "0 0 40px rgba(0,209,255,0.06)",
        }}>
        <p className="text-[clamp(1.25rem,3.5vw,1.75rem)] font-black tracking-tight mb-2">
          Bienvenue sur SecuPRO 👋
        </p>
        <p className="text-[12px] font-medium max-w-xl mx-auto" style={{ color: C.muted }}>
          Ajoutez vos effectifs et vos sites pour activer le tableau de bord opérationnel.
          Votre essai gratuit de 7 jours a déjà démarré.
        </p>

        {/* Compte à rebours mis en avant */}
        {showTrial && trialDaysLeft !== null && (
          <div className="mt-6 mx-auto max-w-md rounded-xl px-5 py-4"
            style={{
              background: `${trialColor}10`,
              border: `1px solid ${trialColor}30`,
            }}>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-2" style={{ color: trialColor }}>
              Essai gratuit — temps restant
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[42px] font-black tabular-nums leading-none" style={{ color: trialColor }}>
                {trialDaysLeft}
              </span>
              <span className="text-[13px] font-bold" style={{ color: "rgba(241,245,249,0.75)" }}>
                jour{trialDaysLeft > 1 ? "s" : ""} sur 7
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full mt-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${trialColor}66, ${trialColor})`,
                }} />
            </div>
          </div>
        )}
        {subscriptionActive && (
          <p className="mt-4 text-[11px] font-semibold" style={{ color: C.green }}>
            Abonnement actif — complétez vos données pour exploiter toutes les fonctionnalités.
          </p>
        )}
      </div>

      {/* 3 cartes d'action */}
      <div className="grid gap-3 onboarding-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <button type="button" style={cardStyle(C.cyan)}
          onClick={() => router.push("/espace-societe/agents")}
          className="onboarding-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Upload size={18} style={{ color: C.cyan }} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: C.cyan }}>
              Importer mes agents
            </span>
          </div>
          <p className="text-[11px] leading-snug" style={{ color: C.muted }}>
            CSV ou saisie : alimentez vos effectifs pour les plannings et la conformité documents.
          </p>
        </button>

        <button type="button" style={cardStyle(C.violet)}
          onClick={() => router.push("/espace-societe/sites")}
          className="onboarding-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: C.violet }} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: C.violet }}>
              Configurer mes sites
            </span>
          </div>
          <p className="text-[11px] leading-snug" style={{ color: C.muted }}>
            Sites et affectations : préparez le terrain avant les missions.
          </p>
        </button>

        <button type="button" style={cardStyle(C.green)}
          onClick={() => fileRef.current?.click()}
          className="onboarding-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px]" aria-hidden>📥</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: C.green }}>
              Importer mon planning
            </span>
          </div>
          <p className="text-[11px] leading-snug" style={{ color: C.muted }}>
            Fichier Excel / CSV avec colonnes Agent, Site, Horaires, Statut.
          </p>
        </button>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4 py-3 rounded-xl text-[11px] font-semibold shadow-lg max-w-[90vw]"
          style={{
            background: toast.variant === "ok" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            border: `1px solid ${toast.variant === "ok" ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.4)"}`,
            color: toast.variant === "ok" ? "#34d399" : "#f87171",
            backdropFilter: "blur(12px)",
          }}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .onboarding-cards { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ── Bannière essai ────────────────────────────────────────────────────────
function TrialBanner({ daysLeft, onUpgrade }: { daysLeft: number; onUpgrade: () => void }) {
  // Couleur dynamique : bleu >3j, orange 2-3j, rouge ≤1j
  const color =
    daysLeft > 3 ? "#60a5fa" :
    daysLeft >= 2 ? "#fbbf24" :
    "#f87171";
  const bgAlpha =
    daysLeft > 3 ? "rgba(96,165,250,0.07)" :
    daysLeft >= 2 ? "rgba(251,191,36,0.07)" :
    "rgba(248,113,113,0.08)";
  const progressPct = Math.round(((7 - daysLeft) / 7) * 100);

  return (
    <div style={{ background: bgAlpha, borderBottom: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between px-5 py-2 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color, flexShrink: 0 }} />
          <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color }}>
            Essai gratuit
          </span>
          <span className="text-[10px] font-semibold" style={{ color: "rgba(241,245,249,0.7)" }}>
            — {daysLeft > 0
              ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""} sur 7`
              : "Dernier jour"}
          </span>
        </div>
        <button
          onClick={onUpgrade}
          className="text-[9px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full"
          style={{ background: `${color}15`, border: `1px solid ${color}40`, color, cursor: "pointer" }}>
          Passer à l&apos;abonnement →
        </button>
      </div>
      {/* Barre de progression */}
      <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full transition-all duration-700"
          style={{
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            boxShadow: `0 0 6px ${color}66`,
          }} />
      </div>
    </div>
  );
}

export default function ChefExploitationDashboard() {
  const router = useRouter();

  type AgentDbPhase = "loading" | "empty" | "has";
  const [agentDbPhase, setAgentDbPhase] = useState<AgentDbPhase>("loading");

  // ── Essai gratuit : calcul jours restants depuis created_at + count agents ─
  const [trialDaysLeft, setTrialDaysLeft]     = useState<number | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [anomalies] = useState<Anomalie[]>(ANOMALIES);
  const [sites]    = useState<Site[]>(SITES);
  const [alertes, setAlertes] = useState<Alerte[]>(ALERTES);
  const [agentsDocs]          = useState<AgentDoc[]>(AGENTS_DOCS);
  const [messages, setMessages] = useState<ContactMessage[]>(INIT_MESSAGES);
  const [trialStartedFlash, setTrialStartedFlash] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("trial_started") === "1") {
      setTrialStartedFlash(true);
      sp.delete("trial_started");
      const q = sp.toString();
      const path = window.location.pathname;
      window.history.replaceState(null, "", q ? `${path}?${q}` : path);
    }
  }, []);

  useEffect(() => {
    async function initDashboard() {
      try {
        const societeId =
          typeof window !== "undefined" ? localStorage.getItem("societe_id") : null;

        if (!societeId) {
          setSubscriptionActive(false);
          setTrialDaysLeft(null);
          setAgentDbPhase("has");
          setAgents(AGENTS);
          return;
        }

        const [{ data: soc, error: socErr }, countRes] = await Promise.all([
          supabase
            .from("societes")
            .select("created_at, subscription_status")
            .eq("id", societeId)
            .single(),
          supabase
            .from("agents")
            .select("id", { count: "exact", head: true })
            .eq("societe_id", societeId),
        ]);

        if (countRes.error) {
          console.warn("[Dashboard] agents count:", countRes.error);
          setAgentDbPhase("has");
          setAgents(AGENTS);
        } else {
          const cnt = countRes.count ?? 0;
          if (cnt === 0) {
            setAgentDbPhase("empty");
            setAgents([]);
          } else {
            setAgentDbPhase("has");
            setAgents(AGENTS);
          }
        }

        if (socErr || !soc) {
          return;
        }

        if (soc.subscription_status === "active") {
          setSubscriptionActive(true);
          setTrialDaysLeft(null);
          return;
        }

        const created  = new Date(soc.created_at);
        const now      = new Date();
        const elapsed  = Math.floor((now.getTime() - created.getTime()) / 86_400_000);
        const daysLeft = Math.max(0, 7 - elapsed);

        setTrialDaysLeft(daysLeft);

        if (daysLeft === 0) {
          router.push("/espace-societe/activation");
        }
      } catch {
        setAgentDbPhase("has");
        setAgents(AGENTS);
      }
    }
    initDashboard();
  }, [router]);

  // SecuIA : alertes documents (dashboard complet uniquement)
  useEffect(() => {
    if (agentDbPhase !== "has") return;
    const docAlerts = genDocAlerts(AGENTS_DOCS);
    if (docAlerts.length > 0) {
      setAlertes(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        return [...prev, ...docAlerts.filter(a => !existingIds.has(a.id))];
      });
    }
  }, [agentDbPhase]);

  // Envoi message agent (sauvegarde Supabase + état local)
  const handleSendMessage = async (agentId: string, agentNom: string, content: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ContactMessage = {
      id: `m-${Date.now()}`, agentId, agentNom, content, time,
    };
    setMessages(prev => [...prev.slice(-49), newMsg]);
    // Sauvegarde Supabase (silencieuse si table absente)
    try {
      const societeId = typeof window !== "undefined" ? localStorage.getItem("societe_id") : null;
      await supabase.from("messages_agents").insert({
        societe_id: societeId ?? MOCK_SOCIETE.id,
        agent_id: agentId, agent_nom: agentNom,
        contenu: content, sent_at: now.toISOString(),
      });
    } catch { /* silencieux */ }
  };

  // IA observe anomalies + agents disponibles → suggestions dérivées
  const suggestions = useMemo(
    () => genererSuggestions(anomalies, agents),
    [anomalies, agents],
  );

  const societeIdForReports =
    typeof window !== "undefined" ? localStorage.getItem("societe_id") : null;

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
          <span style={{fontFamily:"'Rajdhani', sans-serif", fontWeight:700, fontSize:'1.5rem', letterSpacing:'2px'}}>
            <span style={{color:'#fff'}}>Secu</span>
            <span style={{color:'#00aaff'}}>PRO</span>
          </span>
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

      {trialStartedFlash && (
        <div
          className="mx-4 mt-3 max-w-[1440px] md:mx-auto rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.28)",
            boxShadow: "0 0 24px rgba(52,211,153,0.06)",
          }}
          role="status"
        >
          <CheckCircle2 className="shrink-0" style={{ width: 20, height: 20, color: C.green }} />
          <p className="text-[12px] sm:text-[13px] font-semibold flex-1 leading-snug" style={{ color: "#e2e8f0" }}>
            Votre essai de 7 jours commence maintenant !
          </p>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setTrialStartedFlash(false)}
            className="shrink-0 p-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ color: C.muted, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* ── BANNIÈRE ESSAI GRATUIT ── */}
      {agentDbPhase !== "loading" && !subscriptionActive && trialDaysLeft !== null && (
        <TrialBanner
          daysLeft={trialDaysLeft}
          onUpgrade={() => router.push("/tarifs-entreprise")}
        />
      )}

      {/* ── GRILLE ── */}
      <main className="px-4 py-4 max-w-[1440px] mx-auto dash-grid">
        {agentDbPhase === "loading" && (
          <div style={{ gridColumn: "1 / -1" }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-9 h-9 rounded-full animate-spin"
              style={{
                border: "2px solid rgba(0,209,255,0.15)",
                borderTopColor: C.cyan,
              }}
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: C.muted }}>
              Chargement du tableau de bord…
            </p>
          </div>
        )}

        {agentDbPhase === "empty" && (
          <OnboardingPanel
            trialDaysLeft={trialDaysLeft}
            subscriptionActive={subscriptionActive}
            onAgentsImported={setAgents}
          />
        )}

        {agentDbPhase === "has" && (
          <>
            <div id="agents">  <BlocKPIs    agents={agents} anomalies={anomalies} /></div>
            <div id="planning"><BlocPlannings agents={agents} onAgentsImported={setAgents} /></div>
            <BlocAnomalies anomalies={anomalies} />
            <BlocSites   sites={sites} />
            <div id="alertes"> <BlocAlertes alertes={alertes} /></div>
            <BlocIA      suggestions={suggestions} anomalies={anomalies} />
            <BoutonRapportMensuel
              societeId={societeIdForReports ?? MOCK_SOCIETE.id}
              societeName={MOCK_SOCIETE.nom}
            />

            {/* ── EFFECTIFS & CONFORMITÉ DOCUMENTS ── */}
            <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
              <BlocAgentsDocuments docs={agentsDocs} />
            </div>

            {/* ── PORTAIL CONTACT AGENTS LIVE ── */}
            <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
              <BlocPortailContact
                docs={agentsDocs}
                messages={messages}
                onSend={handleSendMessage}
              />
            </div>

            {/* ── CONFORMITÉ CNAPS — MODULES DE PRÉVENTION ── */}
            <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
              <BlockWrap>
                {/* En-tête */}
                <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
                  style={{ borderBottom: `1px solid ${C.blockBdr}` }}>
                  <div className="flex items-center gap-2">
                    <Shield className="shrink-0" style={{ width: "13px", height: "13px", color: C.cyan }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.22em]"
                      style={{ color: C.muted }}>Conformité CNAPS</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.22em]"
                      style={{ color: C.cyan }}>— Modules de prévention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge label={`${CNAPS_MODULES.filter(m => m.statut === "critique").length} critique${CNAPS_MODULES.filter(m => m.statut === "critique").length > 1 ? "s" : ""}`}   color={C.red} />
                    <Badge label={`${CNAPS_MODULES.filter(m => m.statut === "a_verifier").length} à vérifier`} color={C.amber} />
                    <Badge label={`${CNAPS_MODULES.filter(m => m.statut === "conforme").length} conformes`}    color={C.green} />
                  </div>
                </div>

                {/* Grille cartes */}
                <div style={{ padding: "16px" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                  }}
                    className="cnaps-grid"
                  >
                    {CNAPS_MODULES.map((m) => (
                      <CnapsCard key={m.num} {...m} />
                    ))}
                  </div>
                </div>
              </BlockWrap>
            </div>
          </>
        )}
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
        @media (max-width: 640px)  { .cnaps-grid { grid-template-columns: 1fr !important; } }
        .portail-grid { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .portail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
