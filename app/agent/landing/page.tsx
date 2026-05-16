"use client";

import { useState, useEffect } from "react";
import AgentLanding from "@/components/AgentLanding";
import AgentTopBar from "@/components/AgentTopBar";
import { supabase } from "@/lib/supabaseClient";

export default function AgentLandingPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setHasAccess(!!user);
      } catch {
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A1F2F] p-4 pb-20">
        <AgentTopBar
          title="SecuPRO Dashboard"
          subtitle="Opérations Tactiques"
          agentName="Agent Mustapha"
          theme="nocturne"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A1F2F] pb-20">
      <div className="p-4">
        <AgentTopBar
          title="SecuPRO Dashboard"
          subtitle="Opérations Tactiques"
          agentName="Agent Mustapha"
          theme="nocturne"
        />
        <AgentLanding hasAccess={hasAccess} />
      </div>
    </main>
  );
}
