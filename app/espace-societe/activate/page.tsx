"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowLeft, Lock, MoveRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens SecuPRO
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:          "#0B1426",
  card:        "rgba(12, 22, 46, 0.94)",
  inputBg:     "rgba(6, 13, 28, 0.85)",
  cyan:        "#00d1ff",
  cyanBorder:  "rgba(0, 209, 255, 0.22)",
  cyanFocus:   "rgba(0, 209, 255, 0.6)",
  cyanGlow:    "rgba(0, 209, 255, 0.22)",
  cyanDim:     "rgba(0, 209, 255, 0.14)",
  amber:       "#FFBF00",
  text:        "#f1f5f9",
  muted:       "rgba(148, 163, 184, 0.5)",
  label:       "rgba(0, 209, 255, 0.5)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────────────────────

/** Grille décorative + halos de fond */
function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* Grille tactique */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 75% at 50% 25%, black, transparent 70%)",
        }}
      />
      {/* Halo principal haut */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "900px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,209,255,0.09) 0%, transparent 65%)",
        }}
      />
      {/* Halo secondaire bas */}
      <div
        className="absolute bottom-[-80px] left-1/2 -translate-x-1/2"
        style={{
          width: "600px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,60,150,0.18) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/** Spinner cyan animé */
function CyanSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
      className="relative"
      style={{ width: 60, height: 60 }}
    >
      {/* Anneau extérieur */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: "3px solid rgba(0,209,255,0.1)",
          borderTopColor: T.cyan,
          borderRightColor: "rgba(0,209,255,0.45)",
          boxShadow: `0 0 20px rgba(0,209,255,0.4), inset 0 0 12px rgba(0,209,255,0.07)`,
        }}
      />
      {/* Point central */}
      <div
        className="absolute inset-[22px] rounded-full"
        style={{ background: "rgba(0,209,255,0.15)" }}
      />
    </motion.div>
  );
}

/** Barre de scan horizontale */
function ScanBar() {
  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{ width: 220, height: 2, background: "rgba(0,209,255,0.1)" }}
    >
      <motion.div
        className="absolute inset-y-0 w-1/2 rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`,
        }}
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Champ de saisie tactique avec glow au focus */
function TacticalInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  mono = false,
  autoComplete,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  mono?: boolean;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.38em]"
        style={{ color: T.label }}
      >
        <Icon size={11} style={{ color: T.cyan }} />
        {label}
      </label>

      <motion.div
        animate={{
          boxShadow: focused
            ? `0 0 0 2px rgba(0,209,255,0.55), 0 0 24px rgba(0,209,255,0.15)`
            : "0 0 0 1px rgba(0,209,255,0.0)",
        }}
        transition={{ duration: 0.2 }}
        className="rounded-xl"
      >
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) =>
            onChange(mono ? e.target.value.toUpperCase() : e.target.value)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          className={`w-full rounded-xl px-4 py-3.5 text-[13px] font-semibold outline-none transition-colors duration-200 placeholder:font-semibold ${mono ? "font-mono tracking-widest" : "tracking-wide"}`}
          style={{
            background: T.inputBg,
            border: `1px solid ${focused ? T.cyanFocus : T.cyanBorder}`,
            color: T.text,
          }}
        />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────
export default function ActivateEnterprisePage() {
  const router = useRouter();
  const [company, setCompany]   = useState("");
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);

  const ready = company.trim().length > 0 && code.trim().length > 0;

  const handleSubmit = () => {
    if (!ready || loading) return;
    setLoading(true);
    // TODO: brancher sur l'API /api/espace-societe/activate
    setTimeout(() => setLoading(false), 3400);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-5 py-10 overflow-x-hidden"
      style={{ background: T.bg, color: T.text, fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <Background />

      {/* ── Bouton retour ── */}
      <motion.button
        type="button"
        onClick={() => router.push("/espace-societe")}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-md transition-colors duration-200"
        style={{
          background: "rgba(11,20,38,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(148,163,184,0.6)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = T.cyan;
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,209,255,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.6)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        <ArrowLeft size={11} />
        Retour
      </motion.button>

      {/* ── Carte centrale ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Liseré supérieur lumineux */}
        <div
          aria-hidden
          className="absolute top-0 left-[12%] right-[12%] h-px z-10 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(0,209,255,0.5), transparent)`,
          }}
        />

        <div
          className="relative rounded-2xl p-9"
          style={{
            background: T.card,
            border: `1px solid ${T.cyanBorder}`,
            boxShadow:
              "0 0 0 1px rgba(0,209,255,0.04), 0 32px 80px rgba(0,0,0,0.55), 0 0 100px rgba(0,20,60,0.4)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* ── Logo + Titre ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            {/* Logo avec halo */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,209,255,0.14) 0%, transparent 70%)",
                }}
              />
              <Image
                src="/secupro-logo-official.png"
                alt="SecuPRO"
                width={58}
                height={58}
                priority
                style={{ filter: "drop-shadow(0 0 16px rgba(0,209,255,0.45))", position: "relative" }}
              />
            </div>

            {/* Titre */}
            <div className="text-center">
              <p
                className="text-[9px] font-black uppercase tracking-[0.45em] mb-1.5"
                style={{ color: T.label }}
              >
                SecuPRO · Espace Entreprise
              </p>
              <h1 className="text-[1.75rem] font-black leading-none tracking-tight">
                ACTIVATION{" "}
                <span
                  style={{
                    color: T.cyan,
                    textShadow: "0 0 20px rgba(0,209,255,0.7), 0 0 50px rgba(0,209,255,0.3)",
                  }}
                >
                  ENTREPRISE
                </span>
              </h1>
            </div>

            {/* Badge statut */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{
                background: T.cyanDim,
                border: "1px solid rgba(0,209,255,0.18)",
              }}
            >
              {/* Dot ambre pulsant */}
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: T.amber,
                  boxShadow: `0 0 8px ${T.amber}`,
                }}
              />
              <span
                className="text-[9px] font-black uppercase tracking-[0.22em] whitespace-nowrap"
                style={{ color: "rgba(255,191,0,0.8)" }}
              >
                Licence en attente · Activation requise
              </span>
            </div>
          </motion.div>

          {/* Séparateur */}
          <div
            className="h-px mb-7"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.16), transparent)",
            }}
          />

          {/* ── Formulaire ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="flex flex-col gap-5"
          >
            <TacticalInput
              id="company"
              label="Nom de la société"
              icon={Building2}
              value={company}
              onChange={setCompany}
              placeholder="Ex : SÉCURITAS FRANCE SAS"
              autoComplete="organization"
            />

            <TacticalInput
              id="code"
              label="Code d'activation"
              icon={ShieldCheck}
              value={code}
              onChange={setCode}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              mono
              autoComplete="off"
            />

            {/* ── Bouton INITIALISER ── */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!ready || loading}
              whileHover={ready ? { scale: 1.015, y: -1 } : {}}
              whileTap={ready ? { scale: 0.985 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="mt-1 w-full flex items-center justify-center gap-2.5 rounded-[14px] py-4 text-[11px] font-black uppercase tracking-[0.26em] text-white transition-all duration-300"
              style={
                ready
                  ? {
                      background:
                        "linear-gradient(135deg, #004e9a 0%, #0077cc 55%, #00d1ff 100%)",
                      border: "1px solid rgba(0,209,255,0.45)",
                      boxShadow:
                        "0 0 30px rgba(0,119,204,0.45), 0 0 70px rgba(0,209,255,0.14)",
                      cursor: "pointer",
                    }
                  : {
                      background: "rgba(0,20,50,0.55)",
                      border: "1px solid rgba(0,209,255,0.1)",
                      color: "rgba(148,163,184,0.3)",
                      cursor: "not-allowed",
                    }
              }
            >
              <Lock size={13} />
              Initialiser l&apos;interface
              <MoveRight size={13} />
            </motion.button>
          </motion.div>

          {/* Note sécurité */}
          <p
            className="mt-5 text-center text-[9px] font-bold uppercase tracking-[0.28em]"
            style={{ color: "rgba(0,209,255,0.18)" }}
          >
            Connexion chiffrée · Licence SecuPRO vérifiée
          </p>
        </div>

        {/* Footer */}
        <p
          className="mt-5 text-center text-[9px] font-bold uppercase tracking-[0.38em]"
          style={{ color: "rgba(0,209,255,0.1)" }}
        >
          © 2026 SecuPRO — SIRET 10335392600019
        </p>
      </motion.div>

      {/* ── Overlay de chargement ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 backdrop-blur-xl"
            style={{ background: "rgba(11, 20, 38, 0.82)" }}
          >
            {/* Halo derrière le spinner */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.25, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle, rgba(0,209,255,0.12) 0%, transparent 70%)",
              }}
            />

            {/* Spinner */}
            <CyanSpinner />

            {/* Textes + barre de scan */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <p
                className="text-[11px] font-black uppercase tracking-[0.32em]"
                style={{
                  color: T.cyan,
                  textShadow: "0 0 16px rgba(0,209,255,0.65)",
                }}
              >
                Vérification de la licence SecuPRO...
              </p>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.28em]"
                style={{ color: "rgba(0,209,255,0.35)" }}
              >
                Connexion au registre central
              </p>
              <ScanBar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
