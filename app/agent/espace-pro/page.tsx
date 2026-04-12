"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentActivation from "@/components/AgentActivation";
import { isAuthenticatedClient } from "@/lib/authClient";

export default function AgentEspaceProPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!(await isAuthenticatedClient())) {
        router.replace("/");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F14]">
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-[#00d1ff]">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F14]">
      <AgentActivation />
    </div>
  );
}
