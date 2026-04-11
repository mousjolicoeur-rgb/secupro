"use client";

import { useEffect, useMemo, useState } from "react";
import { getAgentProfile } from "@/lib/agentSession";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function AgentAvatar(props: {
  size?: number;
  className?: string;
}) {
  const size = props.size ?? 40;
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const p = getAgentProfile();
    setAvatar(p.avatarDataUrl || "");
    setName(p.fullName || "Agent");

    const onStorage = () => {
      const next = getAgentProfile();
      setAvatar(next.avatarDataUrl || "");
      setName(next.fullName || "Agent");
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("secupro-profile-updated", onStorage as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "secupro-profile-updated",
        onStorage as EventListener
      );
    };
  }, []);

  const initials = useMemo(() => initialsFromName(name), [name]);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        width={size}
        height={size}
        className={[
          "rounded-2xl border border-white/10 object-cover",
          props.className ?? "",
        ].join(" ")}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={[
        "rounded-2xl border border-[#00d1ff]/20 bg-[#020d18] overflow-hidden relative",
        props.className ?? "",
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label={name}
      title={name}
    >
      {/* Scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,209,255,0.04) 3px, rgba(0,209,255,0.04) 4px)",
        }}
      />

      {/* Cercles concentriques radar */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="38" stroke="#00d1ff" strokeWidth="0.4" strokeOpacity="0.25" />
        <circle cx="50" cy="50" r="26" stroke="#00d1ff" strokeWidth="0.4" strokeOpacity="0.18" />
        <circle cx="50" cy="50" r="14" stroke="#39ff14" strokeWidth="0.4" strokeOpacity="0.20" />
        {/* Réticule de visée */}
        <line x1="50" y1="30" x2="50" y2="42" stroke="#00d1ff" strokeWidth="0.6" strokeOpacity="0.55" />
        <line x1="50" y1="58" x2="50" y2="70" stroke="#00d1ff" strokeWidth="0.6" strokeOpacity="0.55" />
        <line x1="30" y1="50" x2="42" y2="50" stroke="#00d1ff" strokeWidth="0.6" strokeOpacity="0.55" />
        <line x1="58" y1="50" x2="70" y2="50" stroke="#00d1ff" strokeWidth="0.6" strokeOpacity="0.55" />
        {/* Point central */}
        <circle cx="50" cy="50" r="1.2" fill="#39ff14" fillOpacity="0.8" />
        {/* Coins de cadrage */}
        <path d="M18 26 L18 18 L26 18" stroke="#00d1ff" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
        <path d="M74 18 L82 18 L82 26" stroke="#00d1ff" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
        <path d="M18 74 L18 82 L26 82" stroke="#00d1ff" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
        <path d="M82 74 L82 82 L74 82" stroke="#00d1ff" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
      </svg>

      {/* Textes data fantômes */}
      <div className="absolute inset-0 pointer-events-none" style={{ fontFamily: "monospace" }}>
        {/* Coin haut gauche */}
        <span
          className="absolute top-[8%] left-[6%] text-[#00d1ff]"
          style={{ fontSize: Math.max(5, size * 0.07), opacity: 0.45, letterSpacing: "0.05em" }}
        >
          SCAN_ACTIVE
        </span>
        {/* Coin haut droit */}
        <span
          className="absolute top-[8%] right-[6%] text-[#39ff14]"
          style={{ fontSize: Math.max(5, size * 0.07), opacity: 0.40, letterSpacing: "0.05em" }}
        >
          0%
        </span>
        {/* Coin bas gauche */}
        <span
          className="absolute bottom-[8%] left-[6%] text-[#00d1ff]"
          style={{ fontSize: Math.max(5, size * 0.07), opacity: 0.35, letterSpacing: "0.05em" }}
        >
          WAITING...
        </span>
        {/* Coin bas droit */}
        <span
          className="absolute bottom-[8%] right-[6%] text-[#39ff14]"
          style={{ fontSize: Math.max(5, size * 0.065), opacity: 0.38, letterSpacing: "0.05em" }}
        >
          ID:--
        </span>
      </div>
    </div>
  );
}

