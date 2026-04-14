"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Cpu,
  Download,
  Euro,
  FileText,
  HelpCircle,
  IdCard,
  LogOut,
  Newspaper,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import AgentAvatar from "@/components/AgentAvatar";
import { supabase } from "@/lib/supabaseClient";
import { upsertAgentProfile, clearAgentAvatar } from "@/lib/agentSession";
import { getTheme, onThemeChange, toggleTheme } from "@/lib/theme";

type ThemeMode = "nocturne" | "normal";

type TacticalIdentity = {
  prenom: string;
  nom: string;
  matricule: string;
};

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function compact(v: string) {
  return v.trim();
}

function buildFromMeta(meta: Record<string, unknown> | null | undefined): TacticalIdentity {
  const prenom = compact(asString(meta?.prenom) || asString(meta?.first_name) || "");
  const nom = compact(asString(meta?.nom) || asString(meta?.last_name) || "");
  const matricule = compact(asString(meta?.matricule) || asString(meta?.badge_id) || "");

  // If only full_name exists, split it in a best-effort way.
  const fullName = compact(asString(meta?.full_name) || asString(meta?.name) || "");
  if ((!prenom || !nom) && fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (!prenom && parts[0]) return { prenom: parts[0], nom: nom || parts.slice(1).join(" "), matricule };
    if (!nom && parts.length > 1) return { prenom: prenom || parts[0], nom: parts.slice(1).join(" "), matricule };
  }

  return { prenom, nom, matricule };
}

type ProfileRow = {
  prenom?: string | null;
  nom?: string | null;
  matricule?: string | null;
  email?: string | null;
  telephone?: string | null;
  societe?: string | null;
  carte_pro?: string | null;
};

async function fetchProfileFromDb(userId: string): Promise<ProfileRow> {
  const cols = "prenom,nom,matricule,email,telephone,societe,carte_pro";

  // Try profiles.id first, then profiles.user_id, then agents
  const tries = [
    { table: "profiles", col: "id" },
    { table: "profiles", col: "user_id" },
    { table: "agents",   col: "id" },
    { table: "agents",   col: "user_id" },
  ];

  for (const t of tries) {
    const { data, error } = await supabase
      .from(t.table)
      .select(cols)
      .eq(t.col, userId)
      .maybeSingle();
    if (error || !data) continue;
    return data as ProfileRow;
  }
  return {};
}

async function upsertProfile(userId: string, row: ProfileRow) {
  await supabase.from("profiles").upsert({ id: userId, ...row }, { onConflict: "id" });
}

export default function AgentProfilPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("nocturne");
  const [identity, setIdentity] = useState<TacticalIdentity>({
    prenom: "",
    nom: "",
    matricule: "",
  });
  const [userId, setUserId] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [societe, setSociete] = useState("");
  const [matricule, setMatricule] = useState("");
  const [cartePro, setCartePro] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProfileIncomplete = !prenom || !nom || !telephone || !societe || !matricule;

  async function saveProfile() {
    if (!userId) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await upsertProfile(userId, {
        prenom, nom, matricule,
        email, telephone, societe,
        carte_pro: cartePro,
      });
      const resolved = { prenom, nom, matricule };
      setIdentity(resolved);
      setSaveMsg("Profil enregistré avec succès.");

      // Notification email (non-bloquant)
      fetch("/api/notify/new-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, email, telephone }),
      }).catch(() => {/* silencieux */});
    } catch {
      setSaveMsg("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  function handleImageChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      upsertAgentProfile({ avatarDataUrl: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
  }

  function onClearAvatar() {
    clearAgentAvatar();
  }

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;

    (async () => {
      setTheme(getTheme());
      unsub = onThemeChange(() => setTheme(getTheme()));

      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        router.replace("/");
        return;
      }

      const uid = data.user.id;
      const authEmail = data.user.email ?? "";
      setUserId(uid);

      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
      const fromMeta = buildFromMeta(meta);
      const fromDb = await fetchProfileFromDb(uid);

      if (cancelled) return;

      const resolved = {
        prenom:    compact(fromDb.prenom    || fromMeta.prenom    || ""),
        nom:       compact(fromDb.nom       || fromMeta.nom       || ""),
        matricule: compact(fromDb.matricule || fromMeta.matricule || ""),
      };
      setIdentity(resolved);
      setPrenom(resolved.prenom);
      setNom(resolved.nom);
      setMatricule(resolved.matricule);
      setEmail(compact(fromDb.email || authEmail));
      setTelephone(compact(fromDb.telephone || ""));
      setSociete(compact(fromDb.societe || ""));
      setCartePro(compact(fromDb.carte_pro || ""));

      // Crée la ligne profiles si elle n'existe pas encore
      if (!fromDb.prenom && !fromDb.email) {
        await upsertProfile(uid, { email: authEmail });
      }

      setAllowed(true);
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

  const hudCardClass = useMemo(() => {
    return [
      "relative rounded-3xl border backdrop-blur-xl",
      theme === "normal"
        ? "border-slate-200 bg-white shadow-sm"
        : "border-cyan-400/15 bg-white/[0.04] shadow-[0_0_40px_rgba(34,211,238,0.06)]",
    ].join(" ");
  }, [theme]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">
          Redirecting…
        </p>
      </div>
    );
  }

  const fieldClass = [
    "w-full border p-4 rounded-2xl outline-none transition-all",
    "font-black tracking-tight tabular-nums",
    "placeholder:text-slate-700 placeholder:font-mono placeholder:tracking-widest placeholder:text-xs",
    "focus:border-[#00d1ff] focus:shadow-[0_0_0_3px_rgba(0,209,255,0.20)]",
    theme === "normal"
      ? "bg-white border-slate-200 text-slate-800"
      : "bg-black/40 border-white/10 text-white",
  ].join(" ");

  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2";

  return (
    <div
      className={[
        "min-h-screen font-sans",
        theme === "normal" ? "bg-[#F8FAFC] text-[#1E293B]" : "bg-[#050A12] text-white",
      ].join(" ")}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <IdCard className={theme === "normal" ? "h-6 w-6 text-cyan-700" : "h-6 w-6 text-cyan-200"} />
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Fiche d&apos;identité <span className="text-[#00D1FF]">Tactique</span>
              </h1>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-slate-500">
              Interface Personnel Agent • lecture seule
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 bg-black/50 p-2 px-3 rounded-sm border border-[#39ff14]/20">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-[#39ff14] opacity-40"></span>
                  <span className="relative inline-flex rounded-sm h-2.5 w-2.5 bg-[#39ff14] shadow-[0_0_8px_#39ff14]"></span>
                </div>
                <span className="text-[10px] font-black tracking-[0.25em] text-[#39ff14] uppercase">
                  Connecté
                </span>
              </div>
              {/* Bouton déconnexion */}
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.replace("/");
                }}
                className="group flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors duration-200"
                style={{ color: "rgba(148,163,184,0.6)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.6)"; }}
              >
                <LogOut size={10} />
                Déconnexion
              </button>
            </div>

            <button
              type="button"
              onClick={() => setTheme(toggleTheme())}
              className={[
                "inline-flex items-center justify-center h-11 w-11 rounded-2xl border transition-colors",
                theme === "normal"
                  ? "border-slate-200 bg-white hover:bg-slate-50"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
              ].join(" ")}
              aria-label="Visual Mode"
              title="Visual Mode"
            >
              <ShieldCheck className={theme === "normal" ? "h-5 w-5 text-slate-600" : "h-5 w-5 text-slate-300"} />
            </button>
          </div>
        </div>

        {/* Bannière profil incomplet */}
        {isProfileIncomplete && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Profil incomplet — Complète tes informations pour activer toutes les fonctionnalités.
            </p>
            <button
              type="button"
              onClick={saveProfile}
              className="shrink-0 text-[10px] font-black uppercase tracking-widest text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 transition-colors"
            >
              ÉDITER MON PROFIL ↓
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Avatar card — image + 2 ronds uniquement */}
          <div className={[hudCardClass, "flex flex-col items-center p-6 md:p-7"].join(" ")}>
            {/* Image pleine largeur — glow néon */}
            <div
              className="w-full overflow-hidden rounded-lg"
              style={{ boxShadow: "0 0 18px rgba(0,209,255,0.30), 0 0 6px rgba(57,255,20,0.18)" }}
            >
              <AgentAvatar
                size={240}
                className="!w-full !h-52 !rounded-lg object-cover"
              />
            </div>

            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />

            {/* Deux boutons ronds centrés */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Télécharger une photo"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-slate-300 hover:border-[#00d1ff]/50 hover:text-[#00d1ff] transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClearAvatar}
                title="Supprimer la photo"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-slate-300 hover:border-red-500/50 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bloc — Données Personnelles */}
          <div className={[hudCardClass, "md:col-span-2 p-6 md:p-7"].join(" ")}>
            <div className="text-sm font-black tracking-tight text-[#00D1FF]">
              Données Personnelles
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Source : Supabase (session + profil)
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Prénom</label>
                <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
            </div>
          </div>

          {/* Bloc — Données Professionnelles */}
          <div className={[hudCardClass, "md:col-span-2 p-6 md:p-7"].join(" ")}>
            <div className="text-sm font-black tracking-tight text-[#00D1FF]">
              Données Professionnelles
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Informations verrouillées • lecture seule
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className={labelClass}>Société</label>
                <input value={societe} onChange={(e) => setSociete(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Matricule</label>
                <input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>N° Carte Professionnelle</label>
                <input value={cartePro} onChange={(e) => setCartePro(e.target.value)} placeholder="À compléter" className={fieldClass} />
              </div>
            </div>

            {/* Save message */}
            {saveMsg && (
              <p className={[
                "mt-4 text-xs font-bold uppercase tracking-widest",
                saveMsg.includes("succès") ? "text-emerald-400" : "text-red-400",
              ].join(" ")}>
                {saveMsg}
              </p>
            )}

            {/* Bouton Enregistrer */}
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-5 w-full py-3.5 rounded-2xl bg-emerald-400 text-[#050A12] text-sm font-black uppercase tracking-widest disabled:opacity-50 active:scale-[0.98] transition-all hover:bg-emerald-300"
            >
              {saving ? "Enregistrement..." : "ENREGISTRER LE PROFIL"}
            </button>
          </div>

          {/* Bloc — Hub Tactique */}
          <div className={[hudCardClass, "p-5 md:p-6 overflow-hidden"].join(" ")}>
            {/* Liseré haut cyan */}
            <div className="absolute left-0 right-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-[#00d1ff]/55 to-transparent" />

            <div className="px-1">
              <div className="text-sm font-black tracking-tight text-[#00D1FF]">
                Hub Tactique
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                Navigation rapide
              </div>
            </div>

            <nav className="mt-4 flex flex-col" aria-label="Hub tactique">
              {[
                { href: "/agent/planning",   label: "Plannings",   Icon: Calendar,   accent: "#00d1ff" },
                { href: "/agent/paie",       label: "Paie",        Icon: Euro,       accent: "#34d399" },
                { href: "/agent/docs",       label: "Documents",   Icon: FileText,   accent: "#a78bfa" },
                { href: "/agent/secu-ai",    label: "Secu AI",     Icon: Cpu,        accent: "#38bdf8" },
                { href: "/agent/actualites", label: "Actualités",  Icon: Newspaper,  accent: "#fbbf24" },
                { href: "/agent/espace-pro", label: "Espace Pro",  Icon: Briefcase,  accent: "#f87171" },
                { href: "/agent/support",    label: "Support",     Icon: HelpCircle, accent: "#00d1ff" },
              ].map(({ href, label, Icon, accent }, i, arr) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "group relative flex cursor-pointer items-center gap-3 px-3 py-3",
                    "transition-all duration-150",
                    "hover:bg-[#00d1ff]/[0.07]",
                    "active:bg-[#00d1ff]/[0.12] active:scale-[0.99]",
                    i < arr.length - 1 ? "border-b border-white/[0.05]" : "",
                  ].join(" ")}
                >
                  {/* Barre gauche colorée au hover */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full opacity-0 transition-all duration-150 group-hover:opacity-100"
                    style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                  />

                  {/* Icône dans un mini-badge */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-all duration-150 group-hover:border-white/20 group-hover:bg-white/[0.07]"
                    style={{ "--tw-shadow-color": accent } as React.CSSProperties}
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-slate-500 transition-colors duration-150 group-hover:text-white"
                      style={{ color: undefined }}
                      aria-hidden="true"
                    />
                  </span>

                  {/* Label */}
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 transition-colors duration-150 group-hover:text-white">
                    {label}
                  </span>

                  {/* Flèche droite */}
                  <svg
                    className="ml-auto h-3 w-3 shrink-0 translate-x-0 text-slate-700 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                    viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  >
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
