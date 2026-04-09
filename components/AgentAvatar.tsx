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
        "rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-100",
        "flex items-center justify-center font-black tracking-tight",
        props.className ?? "",
      ].join(" ")}
      style={{ width: size, height: size, fontSize: Math.max(12, size / 2.6) }}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}

