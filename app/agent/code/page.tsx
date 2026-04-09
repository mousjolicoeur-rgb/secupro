"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentActivation from "@/components/AgentActivation";
import { isAuthenticatedClient } from "@/lib/authClient";

export default function AgentCodePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    (async () => {
      if (!(await isAuthenticatedClient())) {
        router.replace("/");
        return;
      }
      setAllowed(true);
    })();
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[#050A12] text-white flex items-center justify-center">
        <p className="text-cyan-300/80 animate-pulse text-sm font-bold tracking-widest uppercase">
          Redirecting…
        </p>
      </div>
    );
  }

  return <AgentActivation />;
}

