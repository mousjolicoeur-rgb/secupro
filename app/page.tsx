"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) {
      setError("Identifiants incorrects — vérifiez vos accès.");
      setLoading(false);
      return;
    }
    router.push("/agent/profil");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, #020c1b 0%, #04182e 20%, #061f3d 45%, #051a36 70%, #020e21 100%)",
      }}
    >
      {/* ── Ambiance lumineuse cyan ── */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        {/* Orbe cyan centrale */}
        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "1000px",
            height: "1000px",
            background:
              "radial-gradient(circle, rgba(0,209,255,0.16) 0%, rgba(0,140,220,0.09) 35%, rgba(0,80,180,0.04) 60%, transparent 75%)",
          }}
        />
        {/* Lueur basse bleue */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: "700px",
            height: "260px",
            background:
              "radial-gradient(ellipse, rgba(0,100,255,0.14) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Grille tactique */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,209,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.035) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 45%, black 15%, transparent 70%)",
          }}
        />
        {/* Ligne horizon */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "60%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,209,255,0.2) 25%, rgba(0,209,255,0.5) 50%, rgba(0,209,255,0.2) 75%, transparent 100%)",
            boxShadow: "0 0 10px rgba(0,209,255,0.25)",
          }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">

        {/* ── TITRE SECUPRO ── */}
        <div className="text-center">
          <h1
            className="font-black tracking-tighter leading-none select-none"
            style={{ fontSize: "clamp(4.5rem, 18vw, 6.5rem)" }}
          >
            <span
              style={{
                color: "#00d1ff",
                textShadow:
                  "0 0 18px rgba(0,209,255,1), 0 0 40px rgba(0,209,255,0.8), 0 0 80px rgba(0,209,255,0.5), 0 0 140px rgba(0,180,255,0.2)",
              }}
            >
              SECU
            </span>
            <span
              style={{
                color: "#ffffff",
                textShadow: "0 0 22px rgba(255,255,255,0.45), 0 0 50px rgba(0,209,255,0.25)",
              }}
            >
              PRO
            </span>
          </h1>
          <p
            className="mt-2 font-bold uppercase"
            style={{
              fontSize: "9px",
              letterSpacing: "0.45em",
              color: "rgba(0,209,255,0.55)",
              textShadow: "0 0 8px rgba(0,209,255,0.35)",
            }}
          >
            Gestion opérationnelle · Sécurité privée
          </p>
        </div>

        {/* ── Séparateur ── */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.45))" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d1ff", boxShadow: "0 0 8px rgba(0,209,255,0.9)" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,209,255,0.45), transparent)" }} />
        </div>

        {/* ── FORMULAIRE ── */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-200"
            style={{
              background: "rgba(0,25,55,0.65)",
              border: `1px solid ${error ? "rgba(239,68,68,0.55)" : email ? "rgba(0,209,255,0.6)" : "rgba(0,209,255,0.18)"}`,
              boxShadow: email && !error ? "0 0 16px rgba(0,209,255,0.14), inset 0 0 18px rgba(0,209,255,0.05)" : "none",
              backdropFilter: "blur(16px)",
              caretColor: "#00d1ff",
              color: "#ffffff",
            }}
          />

          {/* Mot de passe */}
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl px-5 py-4 pr-12 text-sm font-semibold outline-none transition-all duration-200"
              style={{
                background: "rgba(0,25,55,0.65)",
                border: `1px solid ${error ? "rgba(239,68,68,0.55)" : password ? "rgba(0,209,255,0.6)" : "rgba(0,209,255,0.18)"}`,
                boxShadow: password && !error ? "0 0 16px rgba(0,209,255,0.14), inset 0 0 18px rgba(0,209,255,0.05)" : "none",
                backdropFilter: "blur(16px)",
                caretColor: "#00d1ff",
                color: "#ffffff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "rgba(0,209,255,0.4)" }}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-center font-bold" style={{ color: "#f87171", fontSize: "11px", letterSpacing: "0.04em" }}>
              {error}
            </p>
          )}

          {/* ── SE CONNECTER — Filled cyan ── */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="group relative overflow-hidden w-full rounded-2xl font-black uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed mt-1"
            style={{
              padding: "17px 0",
              fontSize: "13px",
              letterSpacing: "0.2em",
              background: "linear-gradient(135deg, #0095c8 0%, #00d1ff 50%, #0ab8e8 100%)",
              color: "#020e21",
              border: "1px solid rgba(0,209,255,0.5)",
              boxShadow:
                email && password && !loading
                  ? "0 0 32px rgba(0,209,255,0.65), 0 0 70px rgba(0,209,255,0.28), 0 4px 20px rgba(0,209,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
                  : "0 0 10px rgba(0,209,255,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full"
              aria-hidden
            />
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "SE CONNECTER"}
          </button>

          {/* ── S'INSCRIRE — Outlined cyan ── */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="group relative overflow-hidden w-full rounded-2xl font-black uppercase transition-all duration-200 active:scale-[0.98]"
            style={{
              padding: "16px 0",
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: "#00d1ff",
              background: "rgba(0,209,255,0.04)",
              border: "1px solid rgba(0,209,255,0.32)",
              textShadow: "0 0 10px rgba(0,209,255,0.45)",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(0,209,255,0.65)";
              b.style.background = "rgba(0,209,255,0.09)";
              b.style.boxShadow = "0 0 24px rgba(0,209,255,0.18), inset 0 0 24px rgba(0,209,255,0.07)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(0,209,255,0.32)";
              b.style.background = "rgba(0,209,255,0.04)";
              b.style.boxShadow = "none";
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/[0.05] transition-transform duration-700 group-hover:translate-x-full"
              aria-hidden
            />
            S&apos;INSCRIRE
          </button>

        </form>

        {/* ── Footer ── */}
        <p
          className="font-bold uppercase text-center"
          style={{ fontSize: "9px", letterSpacing: "0.35em", color: "rgba(0,209,255,0.18)" }}
        >
          © 2026 SECUPRO COMMAND SYSTEM
        </p>

      </div>
    </div>
  );
}
