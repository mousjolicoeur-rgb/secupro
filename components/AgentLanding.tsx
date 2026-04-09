"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { insertAgentLead } from "@/services/agentLeadService";
import {
  markAgentLeadComplete,
  setAgentDisplayName,
  upsertAgentProfile,
} from "@/lib/agentSession";

export default function AgentLanding() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">
          Loading…
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await insertAgentLead({
      name,
      email,
      company,
    });

    if (insertError) {
      setError("Could not save your registration. Please try again.");
      setLoading(false);
      return;
    }

    setAgentDisplayName(name);
    upsertAgentProfile({ email, company });
    markAgentLeadComplete();
    router.push("/agent/activate");
  };

  const valid = name.trim() && email.trim() && company.trim();

  return (
    <div className="min-h-screen bg-[#0A1F2F] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-[#00D1FF] text-4xl font-black tracking-tighter mb-2">
            SECUPRO <span className="text-white">PRO</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Register as an agent. You will enter your company code on the next
            step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Full name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-[#00D1FF] outline-none transition-all"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-[#00D1FF] outline-none transition-all"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Company name
            </label>
            <input
              type="text"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-[#00D1FF] outline-none transition-all"
              placeholder="Acme Security"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center px-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !valid}
            className="w-full py-5 bg-[#00D1FF] text-[#0A1F2F] font-black rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(0,209,255,0.3)] disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? "Saving…" : "Continue to activation"}
          </button>
        </form>

        <p className="text-gray-600 text-[10px] text-center mt-12 uppercase tracking-widest font-bold">
          © 2026 SECUPRO COMMAND SYSTEM
        </p>
      </div>
    </div>
  );
}
