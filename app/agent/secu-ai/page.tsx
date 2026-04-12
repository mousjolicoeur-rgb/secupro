"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { isAuthenticatedClient } from "@/lib/authClient";
import { getEntrepriseId } from "@/lib/agentSession";
import AgentTopBar from "@/components/AgentTopBar";
import { getTheme, onThemeChange } from "@/lib/theme";

type Message = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Quelle est la durée légale du travail de nuit ?",
  "Comment fonctionne la prime d'ancienneté ?",
  "Quels sont mes droits en cas d'accident du travail ?",
  "Qu'est-ce que le CQP APS ?",
];

const KNOWLEDGE: Record<string, string> = {
  "nuit": "Le travail de nuit est défini entre 21h et 6h. Il ouvre droit à une contrepartie sous forme de repos compensateur ou de majoration salariale selon l'accord d'entreprise. La durée maximale d'une période de nuit est de 8h consécutives.",
  "ancienneté": "La prime d'ancienneté CCN Sécurité est : +3% après 3 ans, +6% après 6 ans, +9% après 9 ans, +12% après 12 ans, +15% après 15 ans. Elle est calculée sur le salaire minimum conventionnel du coefficient.",
  "accident": "Tout accident survenu par le fait ou à l'occasion du travail est un accident du travail. Il doit être déclaré par l'employeur sous 48h. Vous bénéficiez d'une prise en charge à 100% par la Sécurité Sociale et d'une protection contre le licenciement.",
  "cqp": "Le CQP APS (Agent de Prévention et de Sécurité) est le certificat de qualification professionnelle de base de la sécurité privée. Il est obligatoire pour obtenir la Carte Pro CNAPS. La formation dure environ 140h.",
  "cnaps": "La Carte Professionnelle CNAPS est obligatoire pour exercer. Elle est délivrée pour 5 ans et doit être renouvelée. Sans carte valide, vous ne pouvez pas légalement travailler dans la sécurité privée.",
  "heures supplémentaires": "Les heures supplémentaires sont majorées de 25% pour les 8 premières heures au-delà de 35h/semaine, puis 50% au-delà. Elles peuvent être récupérées sous forme de repos compensateur.",
  "congé": "Vous avez droit à 2,5 jours ouvrables de congés payés par mois travaillé, soit 30 jours (5 semaines) par an. La prise de congés doit être accordée par l'employeur.",
  "salaire": "Le salaire minimum est fixé par coefficient selon la CCN Sécurité. Il est supérieur au SMIC légal. Votre coefficient dépend de votre qualification (APS, chef de poste, etc.).",
  "retraite": "Les agents de sécurité bénéficient du régime général de retraite. La retraite complémentaire est gérée par Agirc-Arrco. Le travail de nuit peut donner droit à des trimestres supplémentaires sous certaines conditions.",
  "repos": "Vous avez droit à 11h de repos consécutif minimum entre deux postes. Ce repos est obligatoire et ne peut être réduit qu'exceptionnellement avec contrepartie.",
};

function getAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const [key, answer] of Object.entries(KNOWLEDGE)) {
    if (q.includes(key)) return answer;
  }
  return "Je n'ai pas de réponse précise sur ce sujet dans ma base de connaissances CCN Sécurité. Je vous recommande de consulter votre délégué syndical ou le CNAPS pour des informations officielles.";
}

export default function SecuAIPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Bonjour ! Je suis Secu AI, votre assistant juridique CCN Sécurité. Posez-moi une question sur vos droits, votre contrat ou la convention collective." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: getAnswer(text) }]);
      setThinking(false);
    }, 800);
  };

  const isNormal = theme === "normal";
  const bg = isNormal ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">Chargement…</p>
      </div>
    );
  }

  return (
    <div className={["min-h-screen font-sans flex flex-col", bg].join(" ")}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl px-5 py-6 md:px-8 md:py-8 flex flex-col flex-1">
        <AgentTopBar
          title="SECUPRO / SECU AI"
          agentName="Assistant CCN"
          subtitle="la Convention Collective Nationale"
          subtitleClassName="mt-1 text-sm text-emerald-400 truncate"
          theme={theme}
        />

        <button type="button" onClick={() => router.push("/agent/activate")}
          className={["mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border w-fit transition-colors",
            isNormal ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"].join(" ")}>
          <ArrowLeft className="h-4 w-4" /> Hub
        </button>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)}
                className={["rounded-2xl border p-3 text-xs text-left font-semibold transition-all active:scale-95",
                  isNormal ? "bg-white border-slate-200 text-slate-700 hover:border-cyan-400" : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-cyan-400/40"].join(" ")}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="mt-5 flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m, i) => (
            <div key={i} className={["flex gap-3", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
              )}
              <div className={["max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-cyan-500 text-[#050A12] font-semibold"
                  : isNormal ? "bg-white border border-slate-200 text-slate-700" : "bg-white/[0.06] border border-white/10 text-slate-200",
              ].join(" ")}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-cyan-400 animate-pulse" />
              </div>
              <div className={["rounded-2xl px-4 py-3 text-sm", isNormal ? "bg-white border border-slate-200" : "bg-white/[0.06] border border-white/10"].join(" ")}>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={["flex gap-2 rounded-2xl border p-2",
          isNormal ? "bg-white border-slate-200" : "bg-white/[0.04] border-white/10"].join(" ")}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Posez votre question…"
            className={["flex-1 px-3 py-2 text-sm bg-transparent outline-none",
              isNormal ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-600"].join(" ")}
          />
          <button type="button" onClick={() => send(input)} disabled={!input.trim() || thinking}
            className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center text-[#050A12] disabled:opacity-40 active:scale-95 transition-all">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
