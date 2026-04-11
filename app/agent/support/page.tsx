"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { isAuthenticatedClient } from "@/lib/authClient";
import { getEntrepriseId } from "@/lib/agentSession";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange } from "@/lib/theme";

const CONTACTS = [
  {
    icon: Mail,
    label: "Email support",
    value: "support@secupro.fr",
    action: "mailto:support@secupro.fr",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
  {
    icon: Phone,
    label: "Ligne directe",
    value: "+33 1 00 00 00 00",
    action: "tel:+33100000000",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: MessageSquare,
    label: "Chat en ligne",
    value: "Disponible 8h–20h",
    action: null,
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
];

const FAQ = [
  {
    q: "J'ai oublié mon code entreprise",
    r: "Contactez votre responsable PC Sécurité. Il peut retrouver le code dans le tableau de bord entreprise SECUPRO.",
  },
  {
    q: "Mon GPS ne fonctionne pas lors d'une alerte",
    r: "Vérifiez que la géolocalisation est activée pour votre navigateur. Sur iOS : Réglages > Confidentialité > Service de localisation.",
  },
  {
    q: "Je ne vois pas mes vacations",
    r: "Vos vacations sont synchronisées depuis le planning de votre PC Sécurité. Si elles manquent, demandez à votre responsable de les ajouter dans le dashboard.",
  },
  {
    q: "Comment renouveler ma Carte Pro CNAPS ?",
    r: "La demande de renouvellement doit être effectuée sur le portail CNAPS (cnaps.fr) au moins 2 mois avant l'expiration. Votre employeur peut vous accompagner dans la démarche.",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (!(await isAuthenticatedClient())) { router.replace("/"); return; }
      if (!getEntrepriseId()) { router.replace("/agent/code"); return; }
      setTheme(getTheme());
      unsub = onThemeChange(() => setTheme(getTheme()));
      setReady(true);
    })();
    return () => unsub();
  }, [router]);

  const isNormal = theme === "normal";
  const bg = isNormal ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white";
  const card = isNormal ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.035] border-white/10";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">Chargement…</p>
      </div>
    );
  }

  return (
    <div className={["min-h-screen font-sans pb-12", bg].join(" ")}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl px-5 py-6 md:px-8 md:py-10">
        <AgentTopBar title="SECUPRO / SUPPORT" agentName="Aide & Contact" theme={theme} />

        <button type="button" onClick={() => router.push("/agent/activate")}
          className={["mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border w-fit transition-colors",
            isNormal ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"].join(" ")}>
          <ArrowLeft className="h-4 w-4" /> Hub
        </button>

        {/* Contacts */}
        <p className={["mt-7 mb-3 text-[10px] font-black uppercase tracking-[0.3em]", isNormal ? "text-slate-400" : "text-slate-600"].join(" ")}>Nous contacter</p>
        <div className="space-y-3">
          {CONTACTS.map(({ icon: Icon, label, value, action, color, bg: iconBg }) => {
            const inner = (
              <div className={["rounded-3xl border backdrop-blur-xl p-5 flex items-center gap-4 transition-all", card, action ? "cursor-pointer active:scale-[0.99]" : ""].join(" ")}>
                <div className={["h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0", iconBg].join(" ")}>
                  <Icon className={["h-5 w-5", color].join(" ")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={["text-[10px] font-black uppercase tracking-widest", isNormal ? "text-slate-400" : "text-slate-500"].join(" ")}>{label}</p>
                  <p className={["font-black text-sm mt-0.5", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{value}</p>
                </div>
                {action && <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />}
              </div>
            );
            return action ? (
              <a key={label} href={action}>{inner}</a>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>

        {/* FAQ */}
        <p className={["mt-8 mb-3 text-[10px] font-black uppercase tracking-[0.3em]", isNormal ? "text-slate-400" : "text-slate-600"].join(" ")}>Questions fréquentes</p>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className={["rounded-3xl border overflow-hidden transition-all", card].join(" ")}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
                <p className={["text-sm font-bold", isNormal ? "text-slate-800" : "text-white"].join(" ")}>{item.q}</p>
                <span className={["text-lg text-slate-500 transition-transform duration-200 shrink-0", openFaq === i ? "rotate-180" : ""].join(" ")}>›</span>
              </button>
              {openFaq === i && (
                <div className={["px-5 pb-5 text-xs leading-relaxed border-t", isNormal ? "border-slate-100 text-slate-600" : "border-white/5 text-slate-400"].join(" ")}>
                  <p className="pt-4">{item.r}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className={["mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em]", isNormal ? "text-slate-400" : "text-slate-600"].join(" ")}>
          SECUPRO — Support disponible 7j/7
        </p>
      </div>
    </div>
  );
}
