"use client";

import AgentLanding from "@/components/AgentLanding";
import AgentTopBar from "@/components/AgentTopBar";

export default function PageAgent() {
  return (
    <main className="min-h-screen bg-[#0A1F2F] p-4 pb-20">
      <AgentTopBar 
        title="SecuPRO Dashboard" 
        subtitle="Opérations Tactiques" 
        agentName="Agent Mustapha" 
        theme="nocturne"
      />
      <AgentLanding />
    </main>
  );
}