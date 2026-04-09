"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkActivationCode } from "@/services/entrepriseService";

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
    return null;
  }

  const handleActivation = async () => {
    setLoading(true);
    setError("");

    const entreprise = await checkActivationCode(code.toUpperCase());

    if (entreprise) {
      localStorage.setItem("entreprise_id", entreprise.id);
      localStorage.setItem("entreprise_nom", entreprise.nom);
      router.push("/agent/mission");
    } else {
      setError("Code invalide. Contactez votre PC Sécurité.");
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
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
            Activation de mission
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="CODE ENTREPRISE (EX: BOSS75)"
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
            {loading ? "VÉRIFICATION..." : "DÉMARRER LA MISSION"}
          </button>
        </div>

        <p className="text-gray-600 text-[10px] text-center mt-12 uppercase tracking-widest font-bold">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>
      </div>
    </div>
  );
}
