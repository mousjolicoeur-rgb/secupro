"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import {
  getAgentProfile,
  hasCompletedAgentLead,
  upsertAgentProfile,
  clearAgentAvatar,
} from "@/lib/agentSession";

export default function AgentProfilPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobFunction, setJobFunction] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasCompletedAgentLead()) {
      router.replace("/");
      return;
    }
    const p = getAgentProfile();
    setFullName(p.fullName);
    setAddress(p.address);
    setPhone(p.phone);
    setEmail(p.email);
    setCompany(p.company);
    setJobFunction(p.jobFunction);
    setReady(true);
  }, [router]);

  const canSave = useMemo(() => {
    return true;
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      upsertAgentProfile({
        fullName,
        address,
        phone,
        email,
        company,
        jobFunction,
      });
      setSaving(false);
    } catch (e) {
      setSaving(false);
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const onPickAvatar = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setError("Image too large. Please use an image under 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      upsertAgentProfile({ avatarDataUrl: dataUrl });
      setError("");
    };
    reader.onerror = () => setError("Could not read image.");
    reader.readAsDataURL(file);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050A12] text-white flex items-center justify-center">
        <p className="text-cyan-300/80 animate-pulse text-sm font-bold tracking-widest uppercase">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A12] text-white font-sans">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => router.push("/agent/activate")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/[0.05]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <AgentAvatar size={44} />
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                Personal Profil
              </div>
              <div className="mt-1 text-xl font-black tracking-tight">
                Welcome back, {fullName || "Agent"}.
              </div>
              <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                Your profile stays on this device for quick access during night
                shifts.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15">
                <Camera className="h-4 w-4" />
                Upload avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="button"
                onClick={() => clearAgentAvatar()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/[0.05]"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name" value={fullName} onChange={setFullName} />
            <Field label="Job function" value={jobFunction} onChange={setJobFunction} />
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Company" value={company} onChange={setCompany} />
            <Field label="Tel" value={phone} onChange={setPhone} />
            <Field label="Address" value={address} onChange={setAddress} />
          </div>

          {error ? (
            <p className="mt-5 text-red-400 text-sm font-bold">{error}</p>
          ) : null}

          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-600">
              Night-shift readability • low glare
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="w-full sm:w-auto rounded-2xl bg-[#00D1FF] text-[#050A12] px-6 py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_35px_rgba(0,209,255,0.18)] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
        {props.label}
      </label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-2 w-full bg-transparent text-white placeholder:text-slate-600 outline-none text-sm"
        placeholder="—"
      />
    </div>
  );
}

