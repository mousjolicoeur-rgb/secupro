'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

type TrialStatus = {
  has_trial: boolean;
  days_remaining: number;
  days_elapsed: number;
  is_expired: boolean;
  trial_started_at: string | null;
  subscription_status: string | null;
};

export function useTrial(agentId: string | null) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndInitTrial = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await supabase.rpc('init_agent_trial', { p_agent_id: agentId });
      const { data, error } = await supabase.rpc('get_trial_status', {
        p_agent_id: agentId,
      });
      if (error) throw error;
      setTrialStatus(data as TrialStatus);
    } catch (err) {
      console.error('[useTrial]', err);
      setTrialStatus({
        has_trial: true,
        days_remaining: 7,
        days_elapsed: 0,
        is_expired: false,
        trial_started_at: null,
        subscription_status: null,
      });
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAndInitTrial();
  }, [fetchAndInitTrial]);

  const hasAccess =
    trialStatus?.subscription_status === 'active' ||
    (trialStatus?.has_trial === true && trialStatus?.is_expired === false);

  const isOnTrial =
    trialStatus?.has_trial === true &&
    trialStatus?.is_expired === false &&
    trialStatus?.subscription_status !== 'active';

  return {
    trialStatus,
    loading,
    hasAccess: hasAccess ?? false,
    isOnTrial: isOnTrial ?? false,
    daysRemaining: trialStatus?.days_remaining ?? 7,
    isExpired: trialStatus?.is_expired ?? false,
    refresh: fetchAndInitTrial,
  };
}
