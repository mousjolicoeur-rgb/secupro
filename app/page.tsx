"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* Glow ambiance */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)" }}
        />
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-8">

        {/* ── TITRE ── */}
        <div className="text-center">
          <h1 className="text-7xl font-black tracking-tighter select-none leading-none">
            <span
              style={{
                color: "#2563eb",
                textShadow:
                  "0 0 32px rgba(37,99,235,0.95), 0 0 70px rgba(37,99,235,0.55), 0 0 120px rgba(37,99,235,0.25)",
              }}
            >
              SECU
            </span>
            <span className="text-white">PRO</span>
          </h1>
          <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-700">
            Portail Agent Sécurité
          </p>
        </div>

        {/* ── Séparateur ── */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />

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
            className="w-full rounded-2xl border bg-black px-5 py-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 font-semibold"
            style={{
              borderColor: error ? "rgba(239,68,68,0.45)" : email ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.08)",
              boxShadow: email && !error ? "0 0 16px rgba(37,99,235,0.12)" : "none",
              caretColor: "#2563eb",
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
              className="w-full rounded-2xl border bg-black px-5 py-4 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 font-semibold"
              style={{
                borderColor: error ? "rgba(239,68,68,0.45)" : password ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.08)",
                boxShadow: password && !error ? "0 0 16px rgba(37,99,235,0.12)" : "none",
                caretColor: "#2563eb",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-500 transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-red-400 text-[11px] font-bold tracking-wide text-center -mt-1">
              {error}
            </p>
          )}

          {/* ── Bouton SE CONNECTER ── */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="group relative overflow-hidden w-full rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed mt-1"
            style={{
              background: "#2563eb",
              boxShadow: email && password && !loading
                ? "0 0 28px rgba(37,99,235,0.55), 0 4px 18px rgba(37,99,235,0.3)"
                : "none",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden
            />
            {loading ? (
              <Loader2 size={17} className="animate-spin mx-auto" />
            ) : (
              "SE CONNECTER"
            )}
          </button>

          {/* ── Bouton S'INSCRIRE ── */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "transparent",
              border: "1px solid rgba(34,211,238,0.35)",
              color: "#22d3ee",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,211,238,0.6)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 18px rgba(34,211,238,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,211,238,0.35)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            S&apos;INSCRIRE
          </button>

        </form>

        {/* ── Footer ── */}
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-800">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>

      </div>
    </div>
  );
}
