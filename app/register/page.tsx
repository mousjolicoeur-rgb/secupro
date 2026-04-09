"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    if (data.session) {
      router.push("/agent/code");
      return;
    }

    setSuccess("Compte créé. Vérifie ton email pour confirmer, puis connecte-toi.");
  };

  return (
    <div className="min-h-screen bg-[#050A12] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
        <div className="text-center mb-8">
          <h1 className="text-[#00D1FF] text-4xl font-black tracking-tighter">
            SECUPRO <span className="text-white">PRO</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">Création de compte Agent</p>
        </div>

        <form onSubmit={register} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-[#00D1FF] outline-none transition-all"
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
              autoComplete="new-password"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-[#00D1FF] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="text-red-400 text-sm font-bold">{error}</p>
          ) : null}
          {success ? (
            <p className="text-emerald-300 text-sm font-bold">{success}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-5 bg-[#00D1FF] text-[#050A12] font-black rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(0,209,255,0.25)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-slate-300 text-xs font-black uppercase tracking-widest hover:text-slate-200"
          >
            ← Retour connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

