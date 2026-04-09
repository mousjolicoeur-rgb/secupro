"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getTheme, onThemeChange, toggleTheme } from "@/lib/theme";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"nocturne" | "normal">("nocturne");

  useEffect(() => {
    setTheme(getTheme());
    const unsub = onThemeChange(() => setTheme(getTheme()));
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/agent/activate");
      }
    })();
    return unsub;
  }, [router]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/agent/activate");
  };

  return (
    <div
      className={[
        "min-h-screen font-sans flex items-center justify-center p-6",
        theme === "normal"
          ? "bg-[#F8FAFC] text-[#1E293B]"
          : "bg-[#050A12] text-white",
      ].join(" ")}
    >
      <div
        className={[
          "w-full max-w-md rounded-3xl border p-8",
          theme === "normal"
            ? "border-slate-200 bg-white shadow-sm"
            : "border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.06)]",
        ].join(" ")}
      >
        <div className="flex items-center justify-end mb-3">
          <button
            type="button"
            onClick={() => setTheme(toggleTheme())}
            className={[
              "inline-flex items-center justify-center h-10 w-10 rounded-2xl border transition-colors",
              theme === "normal"
                ? "border-slate-200 bg-white hover:bg-slate-50"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
            ].join(" ")}
            aria-label="Visual Mode"
            title="Visual Mode"
          >
            {theme === "normal" ? (
              <Moon className="h-5 w-5 text-slate-500" />
            ) : (
              <Sun className="h-5 w-5 text-slate-300" />
            )}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[#00D1FF] text-4xl font-black tracking-tighter">
            SECUPRO <span className="text-white">PRO</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Portail Agent — Connexion / Inscription
          </p>
        </div>

        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={[
                "w-full border p-4 rounded-2xl placeholder:text-slate-500 focus:border-[#00D1FF] outline-none transition-all",
                theme === "normal"
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-black/40 border-white/10 text-white placeholder:text-slate-600",
              ].join(" ")}
              placeholder="agent@entreprise.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={[
                "w-full border p-4 rounded-2xl placeholder:text-slate-500 focus:border-[#00D1FF] outline-none transition-all",
                theme === "normal"
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-black/40 border-white/10 text-white placeholder:text-slate-600",
              ].join(" ")}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="text-red-400 text-sm font-bold">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-5 bg-[#00D1FF] text-[#050A12] font-black rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(0,209,255,0.25)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="text-cyan-200 text-xs font-black uppercase tracking-widest hover:text-cyan-100"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
