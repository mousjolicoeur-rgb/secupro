'use client';

import { useState, useEffect } from 'react';

const STRIPE_URL = 'https://buy.stripe.com/28E6oAbTU3ZwaO92FI5gc01';

interface TrialBannerProps {
  daysRemaining?: number;
  isExpired?: boolean;
  agentId?: string | null;
}

export default function TrialBanner({ daysRemaining = 30, isExpired = false }: TrialBannerProps) {
  const [redirecting, setRedirecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Ticker HH:MM:SS pour le dernier jour
  useEffect(() => {
    if (daysRemaining > 1 || isExpired) return;
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [daysRemaining, isExpired]);

  // Auto-redirect Stripe si expiré
  useEffect(() => {
    if (!isExpired) return;
    const timeout = setTimeout(() => handleSubscribe(), 3000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  const handleSubscribe = () => {
    setRedirecting(true);
    window.location.href = STRIPE_URL;
  };

  if (isExpired) {
    return (
      <div className="trial-banner trial-expired">
        <div className="trial-inner">
          <span style={{ fontSize: '22px' }}>🔒</span>
          <div>
            <p style={{ margin: 0, color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>
              Votre essai gratuit est terminé
            </p>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>
              Redirection vers l&apos;abonnement dans quelques secondes…
            </p>
          </div>
          <button onClick={handleSubscribe} disabled={redirecting} className="trial-cta">
            {redirecting ? 'Chargement…' : "S'abonner maintenant"}
          </button>
        </div>
        <style>{bannerCSS}</style>
      </div>
    );
  }

  if (daysRemaining <= 1) {
    return (
      <div className="trial-banner trial-urgent">
        <div className="trial-inner">
          <span>🔥</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>
            Essai gratuit — Dernier jour !{' '}
            <strong style={{ color: '#fb923c', fontFamily: 'monospace' }}>{timeLeft}</strong> restant
          </span>
          <button onClick={handleSubscribe} className="trial-cta" style={{ marginLeft: 'auto' }}>
            Continuer →
          </button>
        </div>
        <style>{bannerCSS}</style>
      </div>
    );
  }

  const progressPercent = Math.round(((7 - daysRemaining) / 7) * 100);

  return (
    <div className="trial-banner">
      <div className="trial-inner">
        <span className="trial-badge">ESSAI GRATUIT — 7 JOURS</span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
          <strong style={{ color: '#38bdf8', fontSize: '15px' }}>{daysRemaining}j</strong> restants
        </span>
        <div style={{ width: '120px', height: '4px', background: '#1e3a5f', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: daysRemaining <= 7 ? '#f59e0b' : '#3b82f6',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <button onClick={handleSubscribe} className="trial-cta-secondary" style={{ marginLeft: 'auto' }}>
          Passer à l&apos;abonnement
        </button>
      </div>
      <style>{bannerCSS}</style>
    </div>
  );
}

const bannerCSS = `
  .trial-banner {
    width: 100%;
    background: linear-gradient(90deg, #0f1923 0%, #0d2035 100%);
    border-bottom: 1px solid #1e3a5f;
    padding: 10px 24px;
    position: sticky;
    top: 0;
    z-index: 50;
    box-sizing: border-box;
  }
  .trial-urgent {
    background: linear-gradient(90deg, #1a0a00 0%, #2d1500 100%);
    border-bottom: 1px solid #f59e0b55;
  }
  .trial-expired {
    background: linear-gradient(90deg, #1a0000 0%, #2d0000 100%);
    border-bottom: 2px solid #ef4444;
    padding: 14px 24px;
  }
  .trial-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .trial-badge {
    background: #1d4ed8;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .trial-cta {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.5px;
    padding: 8px 18px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    margin-left: auto;
  }
  .trial-cta:disabled { opacity: 0.6; cursor: not-allowed; }
  .trial-cta-secondary {
    background: transparent;
    color: #38bdf8;
    font-weight: 600;
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid #1e3a5f;
    cursor: pointer;
    white-space: nowrap;
  }
`;
