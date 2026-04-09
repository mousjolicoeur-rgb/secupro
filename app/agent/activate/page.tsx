"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentActivation from "@/components/AgentActivation";
import { AGENT_LEAD_SESSION_KEY } from "@/components/AgentLanding";

export default function AgentActivatePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(AGENT_LEAD_SESSION_KEY) !== "1") {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse text-sm font-bold tracking-widest uppercase">
          Redirecting…
        </p>
      </div>
    );
  }

  return <AgentActivation />;
}
