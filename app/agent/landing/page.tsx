"use client";

import { useState, useEffect } from "react";
import AgentLanding from "@/components/AgentLanding";
import AgentTopBar from "@/components/AgentTopBar";
import TrialBanner from "@/components/TrialBanner";
import { supabase } from "@/lib/supabaseClient";

export default function AgentLandingPage() {
  const [agentId, setAgentId]             = useState<string | null>(null);
  const [hasAccess, setHasAccess]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [isOnTrial, setIsOnTrial]         = useState(false);
  const [isExpired, setIsExpired]         = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(30);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
        setAgentId(user.id);

        // 1. subscription_status dans la table agents
        const { data: agent } = await supabase
          .from('agents')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (agent?.subscription_status === 'active') {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // 2. Initialise le trial si nécessaire
        await supabase.rpc('init_agent_trial', { p_agent_id: user.id });

        // 3. Statut du trial
        const { data: trial, error } = await supabase.rpc('get_trial_status', {
          p_agent_id: user.id,
        });

        if (!error && trial) {
          const days     = (trial.days_remaining as number) ?? 0;
          const expired  = (trial.is_expired as boolean)   ?? true;
          const hasTrial = (trial.has_trial as boolean)    ?? false;

          setDaysRemaining(days);
          setIsExpired(expired);
          setIsOnTrial(hasTrial && !expired);
          setHasAccess(days > 0);
        } else {
          // Fallback : RPC absent → accès autorisé
          setHasAccess(true);
          setIsOnTrial(true);
          setDaysRemaining(30);
        }
      } catch {
        setHasAccess(true);
        setIsOnTrial(true);
        setDaysRemaining(30);
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
      {(isOnTrial || isExpired) && (
        <TrialBanner
          daysRemaining={daysRemaining}
          isExpired={isExpired}
          agentId={agentId}
        />
      )}
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
