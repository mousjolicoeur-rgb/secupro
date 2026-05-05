"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AtSign, Lock, Eye, EyeOff, LogIn,
  MessageSquare, ShieldCheck, Server,
} from "lucide-react";

const CYAN      = "#00d1ff";
const CYAN_20   = "rgba(0,209,255,0.20)";
const CYAN_60   = "rgba(0,209,255,0.60)";
const CYAN_GLOW = "rgba(0,209,255,0.14)";
const INPUT_BG  = "rgba(5, 12, 30, 0.75)";
const LABEL_CLR = "rgba(0,209,255,0.50)";
const TEXT_MUT  = "rgba(100,120,150,0.45)";

export default function BusinessConnexionPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [focused,  setFocused]  = useState<"email" | "password" | null>(null);

  const borderColor = (f: "email" | "password") =>
    focused === f ? CYAN_60 : CYAN_20;
  const boxShadow = (f: "email" | "password") =>
    focused === f
      ? `0 0 0 3px ${CYAN_GLOW}, 0 0 24px rgba(0,209,255,0.10)`
      : "none";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard-exploitation");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10 overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 110% 70% at 50% 0%, rgba(0,50,120,0.35) 0%, #0B1426 55%)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Grille tactique */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.027) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.027) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 20%, black, transparent 68%)",
        }}
      />
      {/* Halo haut */}
      <div
        aria-hidden
        className="pointer-events-none fixed -z-10 left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 820, height: 440, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,209,255,0.09) 0%, transparent 65%)",
        }}
      />

      {/* ══ CARTE ════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full max-w-[440px] rounded-2xl px-8 py-9"
        style={{
          background: "rgba(10, 20, 46, 0.72)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          border: `1px solid ${CYAN_20}`,
          boxShadow:
            "0 0 0 1px rgba(0,209,255,0.04)," +
            "0 30px 80px rgba(0,0,0,0.55)," +
            "0 0 100px rgba(0,20,70,0.4)",
        }}
      >
        {/* Liseré haut */}
        <div
          aria-hidden
          className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.55), transparent)",
          }}
        />

        {/* ── Logo + Titre ── */}
        <div className="flex flex-col items-center gap-4 mb-7">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-5 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(0,209,255,0.18) 0%, transparent 68%)",
              }}
            />
            <Image
              src="/secupro-logo-official.png"
              alt="SecuPRO"
              width={62}
              height={62}
              priority
              style={{
                filter: "drop-shadow(0 0 16px rgba(0,209,255,0.5))",
                position: "relative",
              }}
            />
          </div>

          <div className="text-center">
            <p
              className="text-[9px] font-black uppercase tracking-[0.48em] mb-1.5"
              style={{ color: LABEL_CLR }}
            >
              SecuPRO · Command Center
            </p>
            <h1
              className="text-[1.45rem] font-black leading-tight tracking-tight"
              style={{ lineHeight: 1.2 }}
            >
              AUTHENTIFICATION SÉCURISÉE
              <br />
              <span
                style={{
                  color: CYAN,
                  textShadow: "0 0 20px rgba(0,209,255,0.75), 0 0 48px rgba(0,209,255,0.3)",
                  fontSize: "1.1rem",
                  letterSpacing: "0.04em",
                }}
              >
                ACCÈS COMMAND CENTER
              </span>
            </h1>
            <p
              className="text-[9px] font-semibold mt-2 uppercase tracking-[0.25em]"
              style={{ color: "rgba(0,209,255,0.35)" }}
            >
              Données chiffrées AES-256 · Accès restreint
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div
          className="w-full h-px mb-6"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)",
          }}
        />

        {/* ── Bannière sécurité ── */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            background: "rgba(0,209,255,0.04)",
            border: "1px solid rgba(0,209,255,0.12)",
          }}
        >
          <ShieldCheck size={14} className="shrink-0" style={{ color: CYAN }} />
          <div>
            <p
              className="text-[8px] font-black uppercase tracking-[0.35em]"
              style={{ color: "rgba(0,209,255,0.5)" }}
            >
              Accès restreint
            </p>
            <p
              className="text-[10px] font-semibold"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Réservé aux entreprises clientes SecuPRO
            </p>
          </div>
          <Server size={11} className="ml-auto shrink-0" style={{ color: "rgba(0,209,255,0.2)" }} />
        </div>

        {/* ══ FORMULAIRE ════════════════════════════════════════════════ */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

          {/* ── Input EMAIL PROFESSIONNEL ── */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em]"
              style={{ color: LABEL_CLR }}
            >
              <AtSign size={10} style={{ color: CYAN }} />
              Email Professionnel
            </label>
            <div
              className="flex items-center rounded-xl transition-all duration-200"
              style={{
                background: INPUT_BG,
                border: `1px solid ${borderColor("email")}`,
                boxShadow: boxShadow("email"),
              }}
            >
              <AtSign
                size={15}
                className="ml-3.5 shrink-0"
                style={{ color: focused === "email" ? CYAN : "rgba(0,209,255,0.3)" }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="direction@entreprise.fr"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-transparent px-3 py-3 text-[13px] font-semibold tracking-wide outline-none placeholder:text-[rgba(148,163,184,0.22)] placeholder:font-medium"
                style={{ color: "#f1f5f9" }}
              />
            </div>
          </div>

          {/* ── Input CODE D'ACCÈS SÉCURISÉ ── */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.4em]"
              style={{ color: LABEL_CLR }}
            >
              <Lock size={10} style={{ color: CYAN }} />
              Code d&apos;accès sécurisé
            </label>
            <div
              className="flex items-center rounded-xl transition-all duration-200"
              style={{
                background: INPUT_BG,
                border: `1px solid ${borderColor("password")}`,
                boxShadow: boxShadow("password"),
              }}
            >
              <Lock
                size={15}
                className="ml-3.5 shrink-0"
                style={{ color: focused === "password" ? CYAN : "rgba(0,209,255,0.3)" }}
              />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••••••"
                autoComplete="off"
                className="flex-1 bg-transparent px-3 py-3 text-[13px] font-semibold outline-none placeholder:text-[rgba(148,163,184,0.22)] placeholder:font-medium"
                style={{
                  color: "#f1f5f9",
                  fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
                  letterSpacing: showPwd ? "0.12em" : "0.22em",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Masquer" : "Afficher"}
                className="mr-3 p-1 rounded-md transition-colors duration-150 focus:outline-none"
                style={{ color: showPwd ? CYAN : "rgba(0,209,255,0.3)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = CYAN)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = showPwd
                    ? CYAN
                    : "rgba(0,209,255,0.3)")
                }
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* ── Bouton ÉTABLIR LA CONNEXION ── */}
          <button
            type="submit"
            className="group relative overflow-hidden mt-1 w-full flex items-center justify-center gap-2.5 rounded-[14px] py-4 text-[11px] font-black uppercase tracking-[0.26em] text-white transition-all duration-300 active:scale-[0.985]"
            style={{
              background: "linear-gradient(135deg, #004e9a 0%, #0077cc 55%, #00a8e8 100%)",
              border: "1px solid rgba(0,209,255,0.45)",
              boxShadow: "0 0 30px rgba(0,119,204,0.5), 0 0 70px rgba(0,209,255,0.16)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 44px rgba(0,119,204,0.65), 0 0 90px rgba(0,209,255,0.24)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 30px rgba(0,119,204,0.5), 0 0 70px rgba(0,209,255,0.16)";
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/8 transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden
            />
            <LogIn size={14} />
            ÉTABLIR LA CONNEXION
          </button>
        </form>

        {/* Note sécurité */}
        <p
          className="mt-5 text-center text-[9px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "rgba(0,209,255,0.16)" }}
        >
          Connexion chiffrée · SecuPRO Command System v2
        </p>
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col items-center gap-2.5 mt-6">
        <p
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(0,209,255,0.1)" }}
        >
          © 2026 SECUPRO COMMAND SYSTEM
        </p>
        <a
          href="mailto:contact@secupro.app?subject=Support Command Center"
          className="inline-flex items-center gap-1.5 transition-colors duration-200"
          style={{ color: TEXT_MUT, textDecoration: "none" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,209,255,0.45)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = TEXT_MUT)
          }
        >
          <MessageSquare size={9} />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
            Contacter le support
          </span>
        </a>
      </div>
    </div>
  );
}
