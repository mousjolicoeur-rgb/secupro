"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CYAN  = "#00d1ff";
const GREEN = "#34d399";
const RED   = "#f87171";

export default function ActivationPage() {
  const router = useRouter();
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed)) {
      setError("Format invalide. Le code doit être au format XXXX-XXXX-XXXX-XXXX.");
      return;
    }

    const societeId =
      typeof window !== "undefined" ? localStorage.getItem("societe_id") : null;

    if (!societeId) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/activation", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: trimmed, societe_id: societeId }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Code invalide.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/espace-societe/dashboard"), 2200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-format: insère les tirets au fur et à mesure
  const handleCodeChange = (val: string) => {
    const clean = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);
    const parts = clean.match(/.{1,4}/g) ?? [];
    setCode(parts.join("-"));
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{
        background:
          "radial-gradient(ellipse 110% 65% at 50% 0%, rgba(0,40,100,0.45) 0%, #0B1426 55%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Grille de fond */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.02) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 20%, black, transparent 68%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", letterSpacing: "3px" }}>
            <span style={{ color: "#fff" }}>Secu</span>
            <span style={{ color: "#00aaff" }}>PRO</span>
          </span>
          <p className="text-[9px] font-black uppercase tracking-[0.45em] mt-1"
            style={{ color: "rgba(0,209,255,0.4)" }}>
            Business
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            /* ── Succès ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
              style={{
                background: "rgba(52,211,153,0.07)",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              <CheckCircle2 size={48} style={{ color: GREEN }} />
              <h2 className="text-xl font-black" style={{ color: GREEN }}>
                Accès débloqué !
              </h2>
              <p className="text-[12px] font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
                Votre abonnement est maintenant actif.<br />
                Redirection vers le dashboard…
              </p>
            </motion.div>
          ) : (
            /* ── Formulaire ── */
            <motion.div
              key="form"
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,20,44,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,209,255,0.1)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              {/* En-tête bloc */}
              <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-3 text-center"
                style={{ borderBottom: "1px solid rgba(0,209,255,0.07)" }}>
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    boxShadow: "0 0 24px rgba(248,113,113,0.15)",
                  }}
                >
                  <Lock size={24} style={{ color: RED }} />
                </div>
                <div>
                  <h1 className="text-[17px] font-black tracking-tight">
                    Votre essai gratuit est terminé
                  </h1>
                  <p className="text-[11px] font-medium mt-1"
                    style={{ color: "rgba(148,163,184,0.6)" }}>
                    Entrez votre code d&apos;activation pour continuer
                  </p>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
                {/* Input code */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="code"
                    className="text-[9px] font-black uppercase tracking-[0.32em]"
                    style={{ color: "rgba(0,209,255,0.55)" }}
                  >
                    Code d&apos;activation
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-xl px-4 py-3 text-center font-mono font-black tracking-[0.25em] text-[16px] outline-none transition-all"
                    style={{
                      background: "rgba(0,209,255,0.04)",
                      border: `1px solid ${error ? "rgba(248,113,113,0.4)" : "rgba(0,209,255,0.18)"}`,
                      color: "#f1f5f9",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${CYAN}55`)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = error ? "rgba(248,113,113,0.4)" : "rgba(0,209,255,0.18)")}
                  />
                  <p className="text-[9px]" style={{ color: "rgba(148,163,184,0.45)" }}>
                    Reçu par email après votre paiement Stripe
                  </p>
                </div>

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
                    >
                      <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: RED }} />
                      <span className="text-[10px] font-semibold" style={{ color: RED }}>
                        {error}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton valider */}
                <motion.button
                  type="submit"
                  disabled={loading || code.length < 19}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-[0.22em] transition-all"
                  style={{
                    background: code.length >= 19 ? CYAN : "rgba(0,209,255,0.12)",
                    color: code.length >= 19 ? "#0a0d12" : "rgba(0,209,255,0.35)",
                    cursor: code.length >= 19 ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Vérification…" : "Activer mon accès"}
                  {!loading && <ArrowRight size={13} />}
                </motion.button>

                {/* Séparateur */}
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <span className="text-[9px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(148,163,184,0.3)" }}>
                    ou
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>

                {/* Bouton choisir un abonnement */}
                <motion.button
                  type="button"
                  onClick={() => router.push("/tarifs-entreprise")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-[0.22em]"
                  style={{
                    background: "rgba(52,211,153,0.07)",
                    border: "1px solid rgba(52,211,153,0.22)",
                    color: GREEN,
                    cursor: "pointer",
                  }}
                >
                  <CreditCard size={13} />
                  Choisir un abonnement
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note support */}
        <p className="text-center text-[10px] mt-5"
          style={{ color: "rgba(148,163,184,0.35)" }}>
          Code perdu ?&nbsp;
          <a href="mailto:support@secupro.app"
            style={{ color: CYAN, textDecoration: "none" }}>
            support@secupro.app
          </a>
        </p>
      </motion.div>
    </div>
  );
}
