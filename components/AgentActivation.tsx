"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkActivationCode } from "@/services/entrepriseService";
import {
  LS_ENTREPRISE_ID,
  LS_ENTREPRISE_NOM,
  clearAgentLeadFlags,
} from "@/lib/agentSession";

export default function AgentActivation() {
  const [isMounted, setIsMounted] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">
          Loading…
        </p>
      </div>
    );
  }

  const handleActivation = async () => {
    setLoading(true);
    setError("");

    const entreprise = await checkActivationCode(code.toUpperCase());

    if (entreprise) {
      localStorage.setItem(LS_ENTREPRISE_ID, entreprise.id);
      localStorage.setItem(LS_ENTREPRISE_NOM, entreprise.nom);
      router.push("/agent/mission");
    } else {
      setError("Invalid code. Contact your security control center.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A1F2F] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[#00D1FF] text-4xl font-black tracking-tighter mb-2">
            SECUPRO <span className="text-white">PRO</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Enter your company code to start the mission.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="COMPANY CODE (e.g. BOSS)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-mono text-xl tracking-widest focus:border-[#00D1FF] outline-none transition-all uppercase text-center"
          />

          {error && (
            <p className="text-red-500 text-xs font-bold text-center px-2">
              {error}
            </p>
          )}

          <button
            onClick={handleActivation}
            disabled={loading || !code}
            className="w-full py-5 bg-[#00D1FF] text-[#0A1F2F] font-black rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(0,209,255,0.3)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? "Checking…" : "Start mission"}
          </button>

          <button
            type="button"
            onClick={() => {
              clearAgentLeadFlags();
              router.push("/");
            }}
            className="w-full py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors"
          >
            ← Back to registration
          </button>
        </div>

        <p className="text-gray-600 text-[10px] text-center mt-12 uppercase tracking-widest font-bold">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>
      </div>
    </div>
  );
}
