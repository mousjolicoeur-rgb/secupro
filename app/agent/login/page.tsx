"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { AtSign, Lock, Eye, EyeOff, LogIn, UserRound } from "lucide-react";

const CYAN      = "#00d1ff";
const CYAN_20   = "rgba(0,209,255,0.20)";
const CYAN_60   = "rgba(0,209,255,0.60)";
const CYAN_GLOW = "rgba(0,209,255,0.14)";
const INPUT_BG  = "rgba(5,12,30,0.75)";
const LABEL_CLR = "rgba(0,209,255,0.50)";
const TEXT_MUT  = "rgba(100,120,150,0.45)";

function AgentLoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const nextPath     = searchParams.get("next") ?? "/agent/hub";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [focused,  setFocused]  = useState<"email" | "password" | null>(null);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const border = (f: "email" | "password") =>
    focused === f ? CYAN_60 : CYAN_20;
  const shadow = (f: "email" | "password") =>
    focused === f ? `0 0 0 3px ${CYAN_GLOW}, 0 0 24px rgba(0,209,255,0.10)` : "none";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) { setError(authErr.message); }
      else { router.replace(nextPath.startsWith("/") ? nextPath : "/agent/hub"); }
    } catch { setError("Une erreur est survenue. Réessayez."); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10 overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse 110% 70% at 50% 0%, rgba(0,50,120,0.35) 0%, #0B1426 55%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Grille tactique */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{
        backgroundImage:
          "linear-gradient(rgba(0,209,255,0.027) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(0,209,255,0.027) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 85% 70% at 50% 20%, black, transparent 68%)",
      }} />
      <div aria-hidden className="pointer-events-none fixed -z-10 left-1/2 top-0 -translate-x-1/2" style={{
        width: 820, height: 440, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,209,255,0.09) 0%, transparent 65%)",
      }} />

      {/* Carte */}
      <div className="relative w-full max-w-[420px] rounded-2xl px-8 py-9" style={{
        background: "rgba(10,20,46,0.72)",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        border: `1px solid ${CYAN_20}`,
        boxShadow: "0 0 0 1px rgba(0,209,255,0.04),0 30px 80px rgba(0,0,0,0.55),0 0 100px rgba(0,20,70,0.4)",
      }}>
        {/* Liseré */}
        <div aria-hidden className="absolute top-0 left-[15%] right-[15%] h-px rounded-full" style={{
          background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.55), transparent)",
        }} />

        {/* Logo + titre */}
        <div className="flex flex-col items-center gap-4 mb-7">
          <div className="relative">
            <div aria-hidden className="absolute -inset-5 rounded-full pointer-events-none" style={{
              background: "radial-gradient(circle, rgba(0,209,255,0.18) 0%, transparent 68%)",
            }} />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "2px", position: "relative" }}>
              <span style={{ color: "#fff" }}>Secu</span>
              <span style={{ color: "#00aaff" }}>PRO</span>
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserRound size={16} style={{ color: CYAN }} />
              <p className="text-[9px] font-black uppercase tracking-[0.48em]" style={{ color: LABEL_CLR }}>
                Espace Agent
              </p>
            </div>
            <h1 className="text-[1.45rem] font-black leading-tight tracking-tight">
              Connexion Agent
            </h1>
            <p className="text-[11px] font-semibold mt-1.5" style={{ color: "rgba(0,209,255,0.45)" }}>
              Votre espace personnel — 100% gratuit
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div className="w-full h-px mb-6" style={{
          background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)",
        }} />

        {/* Erreur */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-[12px] font-semibold" style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
          }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: LABEL_CLR }}>
              <AtSign size={10} style={{ color: CYAN }} />
              Votre email
            </label>
            <div className="flex items-center rounded-xl transition-all duration-200" style={{
              background: INPUT_BG, border: `1px solid ${border("email")}`, boxShadow: shadow("email"),
            }}>
              <AtSign size={15} className="ml-3.5 shrink-0" style={{ color: focused === "email" ? CYAN : "rgba(0,209,255,0.3)" }} />
              <input
                id="email" type="email" value={email} required disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                placeholder="prenom@gmail.com"
                autoComplete="email"
                className="flex-1 bg-transparent px-3 py-3 text-[13px] font-semibold tracking-wide outline-none placeholder:text-[rgba(148,163,184,0.22)] placeholder:font-medium"
                style={{ color: "#f1f5f9" }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: LABEL_CLR }}>
              <Lock size={10} style={{ color: CYAN }} />
              Mot de passe
            </label>
            <div className="flex items-center rounded-xl transition-all duration-200" style={{
              background: INPUT_BG, border: `1px solid ${border("password")}`, boxShadow: shadow("password"),
            }}>
              <Lock size={15} className="ml-3.5 shrink-0" style={{ color: focused === "password" ? CYAN : "rgba(0,209,255,0.3)" }} />
              <input
                id="password" type={showPwd ? "text" : "password"} value={password} required disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="flex-1 bg-transparent px-3 py-3 text-[13px] font-semibold outline-none placeholder:text-[rgba(148,163,184,0.22)] placeholder:font-medium"
                style={{ color: "#f1f5f9", fontFamily: "var(--font-geist-mono),'Courier New',monospace", letterSpacing: showPwd ? "0.12em" : "0.22em" }}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? "Masquer" : "Afficher"}
                className="mr-3 p-1 rounded-md"
                style={{ color: showPwd ? CYAN : "rgba(0,209,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button type="submit" disabled={loading}
            className="group relative overflow-hidden mt-1 w-full flex items-center justify-center gap-2.5 rounded-[14px] py-4 text-[11px] font-black uppercase tracking-[0.26em] text-white transition-all duration-300 active:scale-[0.985]"
            style={{
              background: loading ? "#1a3060" : "linear-gradient(135deg, #004e9a 0%, #0077cc 55%, #00a8e8 100%)",
              border: "1px solid rgba(0,209,255,0.45)",
              boxShadow: "0 0 30px rgba(0,119,204,0.5), 0 0 70px rgba(0,209,255,0.16)",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/8 transition-transform duration-500 group-hover:translate-x-full" aria-hidden />
            <LogIn size={14} />
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {/* Liens */}
        <p className="mt-5 text-center text-[12px]" style={{ color: "rgba(148,163,184,0.5)" }}>
          Pas encore de compte ?{" "}
          <Link href="/register" style={{ color: CYAN, fontWeight: 700, textDecoration: "none" }}>
            S&apos;inscrire gratuitement →
          </Link>
        </p>
        <p className="mt-3 text-center text-[11px]" style={{ color: TEXT_MUT }}>
          Vous êtes une société ?{" "}
          <Link href="/espace-societe" style={{ color: "rgba(0,209,255,0.5)", fontWeight: 600, textDecoration: "none" }}>
            → Espace Société
          </Link>
        </p>
      </div>

      <p className="mt-6 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(0,209,255,0.1)" }}>
        🔒 Données sécurisées · Hébergement UE · RGPD
      </p>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0B1426", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(0,209,255,0.4)", fontSize: 13 }}>Chargement…</span>
      </div>
    }>
      <AgentLoginContent />
    </Suspense>
  );
}
