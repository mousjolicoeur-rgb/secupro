ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_notified_3d BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_notified_1d BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION init_agent_trial(p_agent_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_started TIMESTAMPTZ;
BEGIN
  SELECT trial_started_at INTO v_trial_started
  FROM agents WHERE id = p_agent_id;

  IF v_trial_started IS NULL THEN
    UPDATE agents
    SET trial_started_at = NOW()
    WHERE id = p_agent_id
    RETURNING trial_started_at INTO v_trial_started;
  END IF;

  RETURN v_trial_started;
END;
$$;

CREATE OR REPLACE FUNCTION get_trial_status(p_agent_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_started TIMESTAMPTZ;
  v_subscription_status TEXT;
  v_days_elapsed INT;
  v_days_remaining INT;
BEGIN
  SELECT trial_started_at, subscription_status
  INTO v_trial_started, v_subscription_status
  FROM agents WHERE id = p_agent_id;

  IF v_trial_started IS NULL THEN
    RETURN json_build_object(
      'has_trial', false,
      'days_remaining', 7,
      'days_elapsed', 0,
      'is_expired', false,
      'trial_started_at', null,
      'subscription_status', v_subscription_status
    );
  END IF;

  v_days_elapsed := EXTRACT(DAY FROM (NOW() - v_trial_started))::INT;
  v_days_remaining := GREATEST(0, 7 - v_days_elapsed);

  RETURN json_build_object(
    'has_trial', true,
    'days_remaining', v_days_remaining,
    'days_elapsed', v_days_elapsed,
    'is_expired', v_days_remaining = 0,
    'trial_started_at', v_trial_started,
    'subscription_status', v_subscription_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION init_agent_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_status(UUID) TO authenticated;
