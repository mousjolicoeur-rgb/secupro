"use client";

import AgentLanding from "@/components/AgentLanding";
import AgentTopBar from "@/components/AgentTopBar";

export default function AgentLandingPage() {
  return (
    <main className="min-h-screen bg-[#0A1F2F] pb-20">
      <div className="p-4">
        <AgentTopBar
          title="SecuPRO Dashboard"
          subtitle="Opérations Tactiques"
          agentName="Agent"
          theme="nocturne"
        />
        <AgentLanding />
      </div>
    </main>
  );
}
