"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, SendHorizontal, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { isAuthenticatedClient } from "@/lib/authClient";

type Msg = { id: string; role: "user" | "assistant"; content: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AgentSupportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "w",
      role: "assistant",
      content:
        "Bonjour, je suis l'assistant technique SecuPro. Je peux vous aider pour les documents, les plannings ou Secu AI. Que souhaitez-vous savoir ?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bugOpen, setBugOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugSending, setBugSending] = useState(false);
  const [bugErr, setBugErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      if (!(await isAuthenticatedClient())) {
        router.replace("/");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = useCallback(async () => {
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    setErr(null);
    const userMsg: Msg = { id: uid(), role: "user", content: t };
    const history = [...msgs, userMsg].map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, userMsg]);
    setLoading(true);

    const { data: s } = await supabase.auth.getSession();
    const token = s.session?.access_token;
    if (!token) {
      setLoading(false);
      setErr("Session expirée.");
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/agent/support-chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history }),
      });
    } catch {
      setLoading(false);
      setErr("Réseau indisponible.");
      return;
    }

    const json = (await res.json().catch(() => ({}))) as { error?: string; text?: string };
    setLoading(false);
    if (!res.ok) {
      setErr(json.error || "Erreur.");
      return;
    }
    const reply = (json.text ?? "").trim();
    if (!reply) {
      setErr("Réponse vide.");
      return;
    }
    setMsgs((m) => [...m, { id: uid(), role: "assistant", content: reply }]);
  }, [input, loading, msgs]);

  const submitBug = async () => {
    const desc = bugDesc.trim();
    if (!desc || bugSending) return;

    setBugErr(null);
    const { data: s } = await supabase.auth.getSession();
    const token = s.session?.access_token;
    if (!token) {
      setBugErr("Session expirée.");
      return;
    }

    setBugSending(true);
    try {
      const res = await fetch("/api/agent/support-bug", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: bugTitle.trim() || undefined,
          description: desc,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setBugErr(json.error || "Envoi impossible.");
        return;
      }
      setBugOpen(false);
      setBugTitle("");
      setBugDesc("");
    } catch {
      setBugErr("Réseau indisponible.");
    } finally {
      setBugSending(false);
    }
  };

  useEffect(() => {
    if (!bugOpen) setBugErr(null);
  }, [bugOpen]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A12]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d1ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#0a1628]/90 to-[#050A12]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <header className="mb-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/agent/hub")}
              className="block text-left font-black tracking-tight"
              aria-label="SecuPro — retour hub"
            >
              <span className="text-[#00d1ff]">SECU</span>
              <span className="text-white">PRO</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/agent/hub")}
              className="inline-flex shrink-0 items-center gap-2 pt-1 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-wide sm:text-3xl">
            <span className="text-[#00d1ff]">SUPPORT</span>{" "}
            <span className="text-white">TECHNIQUE</span>
          </h1>
        </header>

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#00d1ff]/25 bg-[#0c1420]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_rgba(0,209,255,0.1)] backdrop-blur-md"
        >
          <div className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:min-h-[320px] sm:px-4 sm:py-5">
            {msgs.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    msg.role === "assistant"
                      ? "max-w-[88%] rounded-2xl border border-[#00d1ff]/35 bg-gradient-to-br from-[#00d1ff]/20 to-blue-900/40 px-4 py-3 text-sm leading-relaxed text-sky-50 shadow-[0_0_20px_rgba(0,209,255,0.15)] sm:max-w-[85%]"
                      : "max-w-[88%] rounded-2xl border border-white/10 bg-slate-600/30 px-4 py-3 text-sm leading-relaxed text-slate-100 sm:max-w-[85%]"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-[#00d1ff]/30 bg-[#00d1ff]/5 px-4 py-3 text-[#00d1ff]/90">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Réponse…</span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {err ? (
            <p className="border-t border-red-500/30 bg-red-950/40 px-4 py-2 text-center text-xs text-red-200">
              {err}
            </p>
          ) : null}

          <div className="border-t border-white/10 p-3 sm:p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send()}
                placeholder="Posez votre question…"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#00d1ff]/50 focus:ring-2 focus:ring-[#00d1ff]/15"
              />
              <button
                type="button"
                disabled={loading || !input.trim()}
                onClick={() => void send()}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#00d1ff]/45 bg-[#00d1ff]/15 px-4 py-3 text-[#00d1ff] hover:bg-[#00d1ff]/25 disabled:opacity-40"
                aria-label="Envoyer"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setBugOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 py-3.5 text-xs font-bold uppercase tracking-widest text-amber-100 hover:bg-amber-500/20"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Signaler un Bug
          </button>
        </div>
      </div>

      {bugOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-title"
          onClick={(e) => e.target === e.currentTarget && !bugSending && setBugOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="bug-title" className="text-lg font-bold text-white">
              Signaler un bug
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Le message est envoyé à support@secupro.app depuis nos serveurs (Resend).
            </p>
            <label className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Sujet
              <input
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#00d1ff]/50"
                placeholder="Résumé du problème"
                disabled={bugSending}
              />
            </label>
            <label className="mt-3 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Description
              <textarea
                value={bugDesc}
                onChange={(e) => setBugDesc(e.target.value)}
                rows={4}
                className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#00d1ff]/50"
                placeholder="Étapes, message d'erreur, appareil…"
                disabled={bugSending}
              />
            </label>
            {bugErr ? (
              <p className="mt-3 text-center text-xs font-medium text-red-400">{bugErr}</p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={bugSending}
                onClick={() => setBugOpen(false)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={bugSending || !bugDesc.trim()}
                onClick={() => void submitBug()}
                className="flex-1 rounded-lg border border-[#00d1ff]/50 bg-[#00d1ff]/15 py-2.5 text-xs font-bold uppercase tracking-widest text-[#00d1ff] hover:bg-[#00d1ff]/25 disabled:opacity-50"
              >
                {bugSending ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
