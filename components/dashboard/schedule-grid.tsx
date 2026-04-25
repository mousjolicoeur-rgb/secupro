"use client";
import { Phone, UploadCloud, ScanLine, FileText, Table2 } from "lucide-react";

type AgentStatus = "disponible" | "en_poste" | "retard" | "repos" | "absence" | "carte_pro_expiree" | string;
interface Agent { id: string; prenom: string; nom: string; tel: string; status: AgentStatus; site?: string }
interface Site  { id: string; nom: string; agents: number; status: "nominal" | "alerte" | "critique" }

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  disponible:        { color:"#00FFCC", label:"Disponible" },
  en_poste:          { color:"#00FFCC", label:"En poste"   },
  retard:            { color:"#FFCC00", label:"Retard"     },
  repos:             { color:"#6688AA", label:"Repos"      },
  absence:           { color:"#f87171", label:"Absence"    },
  carte_pro_expiree: { color:"#f87171", label:"Carte expirée" },
};
function cfg(s: string) { return STATUS_CFG[s] ?? { color:"#94a3b8", label: s }; }

interface Props {
  agents:        Agent[];
  sites:         Site[];
  onImportClick: () => void;
  onExportPDF:   () => void;
  onExportXLSX:  () => void;
}

export function ScheduleGrid({ agents, sites, onImportClick, onExportPDF, onExportXLSX }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background:"rgba(10,20,44,0.88)",
        border:"1px solid rgba(0,255,204,0.1)",
        boxShadow:"0 0 40px rgba(0,0,0,0.3)",
        backdropFilter:"blur(16px)",
      }}>

      {/* Header du bloc */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom:"1px solid rgba(0,255,204,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full"
            style={{ background:"linear-gradient(180deg, #00FFCC, #00d1ff)" }} />
          <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color:"#f1f5f9" }}>
            Planning &amp; Effectifs
          </span>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
            style={{ background:"rgba(0,255,204,0.08)", border:"1px solid rgba(0,255,204,0.2)", color:"#00FFCC" }}>
            {agents.length} agents
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={onExportPDF}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-150"
            style={{ color:"rgba(148,163,184,0.5)", border:"1px solid rgba(148,163,184,0.1)", background:"transparent" }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="#00d1ff"; b.style.borderColor="rgba(0,209,255,0.3)"; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="rgba(148,163,184,0.5)"; b.style.borderColor="rgba(148,163,184,0.1)"; }}>
            <FileText size={9} /> PDF
          </button>
          <button onClick={onExportXLSX}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-150"
            style={{ color:"rgba(148,163,184,0.5)", border:"1px solid rgba(148,163,184,0.1)", background:"transparent" }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="#00FFCC"; b.style.borderColor="rgba(0,255,204,0.3)"; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color="rgba(148,163,184,0.5)"; b.style.borderColor="rgba(148,163,184,0.1)"; }}>
            <Table2 size={9} /> XLSX
          </button>
          <button onClick={onImportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-150"
            style={{ background:"rgba(0,255,204,0.08)", border:"1px solid rgba(0,255,204,0.25)", color:"#00FFCC" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,255,204,0.14)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,255,204,0.08)"; }}>
            <UploadCloud size={9} /> Importer
          </button>
        </div>
      </div>

      {/* Sites summary row */}
      <div className="flex gap-2 px-5 py-2.5"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        {sites.map(s => (
          <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-semibold"
            style={{
              background: s.status === "nominal" ? "rgba(0,255,204,0.06)" : "rgba(248,113,113,0.06)",
              border: `1px solid ${s.status === "nominal" ? "rgba(0,255,204,0.18)" : "rgba(248,113,113,0.25)"}`,
              color: s.status === "nominal" ? "rgba(0,255,204,0.75)" : "#f87171",
            }}>
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: s.status === "nominal" ? "#00FFCC" : "#f87171",
                boxShadow: s.status === "nominal" ? "0 0 4px #00FFCC" : "0 0 4px #f87171" }} />
            {s.nom} · {s.agents} ag.
          </div>
        ))}
      </div>

      {/* Table header */}
      <div className="grid px-5 py-2 text-[8px] font-black uppercase tracking-[0.3em]"
        style={{ gridTemplateColumns:"1fr 1fr 1.2fr 1.2fr 1fr",
          color:"rgba(148,163,184,0.35)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span>Prénom</span><span>Nom</span><span>Statut</span><span>Site</span><span>Tél</span>
      </div>

      {/* Agent rows */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight:"320px" }}>
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <UploadCloud size={28} style={{ color:"rgba(0,255,204,0.2)" }} />
            <p className="text-[10px] font-semibold" style={{ color:"rgba(148,163,184,0.4)" }}>
              Aucun agent · Importez un fichier pour commencer
            </p>
          </div>
        ) : agents.map((a, i) => {
          const { color, label } = cfg(a.status);
          const isActive = a.status === "en_poste" || a.status === "disponible";
          return (
            <div key={a.id}
              className="grid items-center px-5 py-2.5 transition-colors duration-100"
              style={{
                gridTemplateColumns:"1fr 1fr 1.2fr 1.2fr 1fr",
                borderBottom: i < agents.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "rgba(0,255,204,0.025)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>

              <span className="text-[11px] font-semibold truncate pr-2" style={{ color:"#f1f5f9" }}>
                {a.prenom}
              </span>
              <span className="text-[11px] font-semibold truncate pr-2" style={{ color:"rgba(241,245,249,0.65)" }}>
                {a.nom}
              </span>

              {/* Badge statut */}
              <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em]"
                style={{ background:`${color}12`, border:`1px solid ${color}30`, color,
                  boxShadow:`0 0 6px ${color}20` }}>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                    style={{ background:color, boxShadow:`0 0 4px ${color}` }} />
                )}
                {label}
              </span>

              <span className="text-[10px] font-medium truncate pr-2"
                style={{ color:"rgba(148,163,184,0.55)" }}>
                {a.site ?? "—"}
              </span>

              <a href={`tel:${a.tel}`}
                className="flex items-center gap-1 text-[9px] font-mono transition-all duration-150 w-fit rounded-md px-1.5 py-0.5"
                style={{ color:"rgba(0,209,255,0.5)", border:"1px solid transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color="#00FFCC"; (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(0,255,204,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color="rgba(0,209,255,0.5)"; (e.currentTarget as HTMLAnchorElement).style.borderColor="transparent"; }}>
                <Phone size={8} /> {a.tel}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
