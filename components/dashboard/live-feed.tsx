"use client";
import { Phone, AlertTriangle, CheckCircle2, MessageSquare, Activity } from "lucide-react";

interface Anomalie { id: string; site: string; nom: string; prenom: string; tel: string; motif: string }
interface Message  { id: string; auteur: string; texte: string; heure: string; urgent: boolean }

interface Props {
  anomalies: Anomalie[];
  messages:  Message[];
  onCall:    (name: string, tel: string) => void;
}

export function LiveFeed({ anomalies, messages, onCall }: Props) {
  const events = [
    ...anomalies.map(a => ({
      id: `a-${a.id}`, type: "alerte" as const,
      title: `${a.prenom} ${a.nom}`,
      sub: `${a.site} · ${a.motif}`,
      time: "En cours",
      tel: a.tel,
      name: `${a.prenom} ${a.nom}`,
    })),
    ...messages.map(m => ({
      id: `m-${m.id}`, type: m.urgent ? "urgent" as const : "info" as const,
      title: m.auteur,
      sub: m.texte,
      time: m.heure,
      tel: null as null,
      name: "",
    })),
    { id:"sys1", type:"success" as const, title:"Sarah K.",      sub:"Prise de poste confirmée · Site Orange",   time:"13:55", tel:null, name:"" },
    { id:"sys2", type:"info"    as const, title:"Système SecuAI", sub:"Analyse planning · 92% taux de couverture", time:"13:40", tel:null, name:"" },
    { id:"sys3", type:"success" as const, title:"Rachid E.",      sub:"Vacation terminée · Site BNP",              time:"14:02", tel:null, name:"" },
  ];

  const TYPE_CFG = {
    alerte:  { color:"#f87171", Icon: AlertTriangle, bg:"rgba(248,113,113,0.07)", border:"rgba(248,113,113,0.2)" },
    urgent:  { color:"#FFCC00", Icon: AlertTriangle, bg:"rgba(255,204,0,0.07)",   border:"rgba(255,204,0,0.2)"   },
    success: { color:"#00FFCC", Icon: CheckCircle2,  bg:"rgba(0,255,204,0.05)",   border:"rgba(0,255,204,0.12)"  },
    info:    { color:"#818cf8", Icon: MessageSquare, bg:"rgba(129,140,248,0.05)", border:"rgba(129,140,248,0.12)" },
  };

  return (
    <div className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background:"rgba(10,20,44,0.88)",
        border:"1px solid rgba(0,255,204,0.08)",
        backdropFilter:"blur(16px)",
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom:"1px solid rgba(0,255,204,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full"
            style={{ background:"linear-gradient(180deg, #818cf8, #00d1ff)" }} />
          <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color:"#f1f5f9" }}>
            Flux Temps Réel
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background:"#00FFCC", boxShadow:"0 0 6px #00FFCC" }} />
          <Activity size={11} style={{ color:"rgba(0,255,204,0.5)" }} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]"
            style={{ color:"rgba(0,255,204,0.5)" }}>
            {events.length} événements
          </span>
        </div>
      </div>

      {/* Feed scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5">
        {events.map(ev => {
          const tc = TYPE_CFG[ev.type];
          return (
            <div key={ev.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{ background: tc.bg, border:`1px solid ${tc.border}` }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = "0.9")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}>

              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background:`${tc.color}15`, border:`1px solid ${tc.color}25` }}>
                <tc.Icon size={12} style={{ color: tc.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black" style={{ color:"#f1f5f9" }}>
                    {ev.title}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color:"rgba(148,163,184,0.4)" }}>
                    {ev.time}
                  </span>
                </div>
                <p className="text-[9px] truncate" style={{ color:"rgba(148,163,184,0.6)" }}>
                  {ev.sub}
                </p>
              </div>

              {ev.tel && (
                <button
                  onClick={() => onCall(ev.name, ev.tel!)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold shrink-0 transition-all duration-150"
                  style={{ background:"rgba(0,255,204,0.07)", border:"1px solid rgba(0,255,204,0.2)", color:"#00FFCC" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,255,204,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(0,255,204,0.07)"; }}>
                  <Phone size={8} /> Appeler
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
