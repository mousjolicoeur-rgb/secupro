"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, #020c1b 0%, #04182e 20%, #061f3d 45%, #051a36 70%, #020e21 100%)",
      }}
    >
      {/* Ambiance CSS pure — aucun JS, aucune animation */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "1000px",
            height: "1000px",
            background:
              "radial-gradient(circle, rgba(0,209,255,0.14) 0%, rgba(0,140,220,0.07) 35%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,209,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.03) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 45%, black 15%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">

        {/* Logo officiel */}
        <div className="text-center flex flex-col items-center gap-3">
          <Image
            src="/secupro-logo-official.png"
            alt="SecuPRO"
            width={200}
            height={200}
            priority
            style={{
              filter: "drop-shadow(0 0 24px rgba(41,212,245,0.35)) drop-shadow(0 0 48px rgba(41,212,245,0.15))",
            }}
          />
          <p
            className="font-bold uppercase"
            style={{
              fontSize: "9px",
              letterSpacing: "0.45em",
              color: "rgba(0,209,255,0.55)",
            }}
          >
            Gestion opérationnelle · Sécurité privée
          </p>
        </div>

        {/* Séparateur */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.4))" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d1ff", boxShadow: "0 0 8px rgba(0,209,255,0.9)" }} />
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,209,255,0.4), transparent)" }} />
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-2xl font-black uppercase transition-all duration-200 active:scale-[0.98]"
            style={{
              padding: "17px 0",
              fontSize: "13px",
              letterSpacing: "0.2em",
              background: "linear-gradient(135deg, #0095c8 0%, #00d1ff 50%, #0ab8e8 100%)",
              color: "#020e21",
              boxShadow: "0 0 32px rgba(0,209,255,0.45), 0 4px 20px rgba(0,209,255,0.25)",
            }}
          >
            SE CONNECTER
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full rounded-2xl font-black uppercase transition-all duration-200 active:scale-[0.98]"
            style={{
              padding: "16px 0",
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: "#00d1ff",
              background: "rgba(0,209,255,0.04)",
              border: "1px solid rgba(0,209,255,0.32)",
            }}
          >
            S&apos;INSCRIRE
          </button>

        </div>

        <p
          className="font-bold uppercase text-center"
          style={{ fontSize: "9px", letterSpacing: "0.35em", color: "rgba(0,209,255,0.15)" }}
        >
          © 2026 SECUPRO COMMAND SYSTEM
        </p>

      </div>
    </div>
  );
}
