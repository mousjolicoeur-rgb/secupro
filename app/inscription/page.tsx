"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CYAN  = "#00d1ff";
const GREEN = "#34d399";
const RED   = "#f87171";
const NAVY  = "#0B1426";

export default function InscriptionPage() {
  const router = useRouter();

  const [nomSociete, setNomSociete] = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      // 1. Créer le compte Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/espace-societe/dashboard`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Création du compte échouée.");

      // 2. Créer la société via API (service role)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:     authData.user.id,
          nom_societe: nomSociete.trim(),
          email,
        }),
      });

      const data = await res.json() as { societe_id?: string; error?: string };

      if (!res.ok || !data.societe_id) {
        throw new Error(data.error ?? "Impossible de créer votre espace société.");
      }

      // 3. Stocker le societe_id et poursuivre vers la collecte CB (Stripe, essai 7j)
      localStorage.setItem("societe_id", data.societe_id);
      localStorage.setItem("societe_nom", nomSociete.trim());
      sessionStorage.setItem(
        "inscription_checkout",
        JSON.stringify({ societe_id: data.societe_id, email }),
      );

      router.push("/inscription/paiement");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue.";
      // Traduction des erreurs Supabase
      if (msg.includes("already registered") || msg.includes("User already")) {
        setError("Un compte existe déjà avec cet email. Connectez-vous.");
      } else if (msg.includes("Password")) {
        setError("Mot de passe trop faible. Utilisez au moins 8 caractères.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: `radial-gradient(ellipse 110% 65% at 50% 0%, rgba(0,40,100,0.45) 0%, ${NAVY} 55%)`,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Grille de fond */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.02) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 20%, black, transparent 68%)",
        }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => router.push("/entreprises")}
            style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2rem", letterSpacing: "3px" }}>
              <span style={{ color: "#fff" }}>Secu</span>
              <span style={{ color: "#00aaff" }}>PRO</span>
            </span>
          </button>
          <p className="text-[9px] font-black uppercase tracking-[0.45em] mt-1"
            style={{ color: "rgba(0,209,255,0.4)" }}>Business</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="form"
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,20,44,0.88)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,209,255,0.1)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              {/* En-tête */}
              <div className="px-6 pt-6 pb-5 text-center"
                style={{ borderBottom: "1px solid rgba(0,209,255,0.07)" }}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.28em]"
                    style={{ color: "rgba(52,211,153,0.8)" }}>
                    Essai 7 jours · CB après inscription (aucun débit immédiat)
                  </span>
                </div>
                <h1 className="text-[18px] font-black tracking-tight">
                  Créer votre espace société
                </h1>
                <p className="text-[11px] font-medium mt-1"
                  style={{ color: "rgba(148,163,184,0.5)" }}>
                  Étape 1 sur 2 — vous enregistrerez votre carte sur une page sécurisée Stripe.
                </p>
              </div>

              {/* Champs */}
              <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
                {/* Nom société */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.32em]"
                    style={{ color: "rgba(0,209,255,0.55)" }}>
                    Nom de la société
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(0,209,255,0.35)" }} />
                    <input
                      type="text"
                      value={nomSociete}
                      onChange={(e) => setNomSociete(e.target.value)}
                      required
                      placeholder="Ex: Sécurité Lyon Sud"
                      className="w-full rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none transition-all"
                      style={{
                        background: "rgba(0,209,255,0.04)",
                        border: "1px solid rgba(0,209,255,0.15)",
                        color: "#f1f5f9",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = `${CYAN}44`)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,209,255,0.15)")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.32em]"
                    style={{ color: "rgba(0,209,255,0.55)" }}>
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(0,209,255,0.35)" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="direction@votre-societe.fr"
                      className="w-full rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none transition-all"
                      style={{
                        background: "rgba(0,209,255,0.04)",
                        border: "1px solid rgba(0,209,255,0.15)",
                        color: "#f1f5f9",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = `${CYAN}44`)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,209,255,0.15)")}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.32em]"
                    style={{ color: "rgba(0,209,255,0.55)" }}>
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(0,209,255,0.35)" }} />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                      className="w-full rounded-xl pl-9 pr-10 py-3 text-[13px] outline-none transition-all"
                      style={{
                        background: "rgba(0,209,255,0.04)",
                        border: "1px solid rgba(0,209,255,0.15)",
                        color: "#f1f5f9",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = `${CYAN}44`)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,209,255,0.15)")}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.4)" }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Force du mot de passe */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 rounded-full transition-all" style={{
                          background: password.length >= (i + 1) * 3
                            ? (password.length >= 12 ? GREEN : password.length >= 8 ? "#fbbf24" : RED)
                            : "rgba(255,255,255,0.07)",
                        }} />
                      ))}
                    </div>
                  )}
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
                      <span className="text-[10px] font-semibold" style={{ color: RED }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all"
                  style={{
                    background: loading ? "rgba(0,209,255,0.2)" : `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)`,
                    color: loading ? "rgba(0,209,255,0.5)" : NAVY,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 0 32px rgba(0,209,255,0.3)",
                  }}
                >
                  {loading ? "Création en cours…" : "Créer mon compte gratuit — 7 jours offerts"}
                  {!loading && <ArrowRight size={13} />}
                </motion.button>

                {/* Légal */}
                <p className="text-center text-[9px]" style={{ color: "rgba(148,163,184,0.3)" }}>
                  Puis 69,99 €/mois après l’essai · Résiliable à tout moment
                </p>

                {/* Lien connexion */}
                <p className="text-center text-[10px]" style={{ color: "rgba(148,163,184,0.45)" }}>
                  Déjà un compte ?&nbsp;
                  <button type="button" onClick={() => router.push("/login")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: CYAN, fontWeight: 700 }}>
                    Se connecter
                  </button>
                </p>
              </form>
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
