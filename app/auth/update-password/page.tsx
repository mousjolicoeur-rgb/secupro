'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Eye, EyeOff } from 'lucide-react';

const CYAN      = '#00d1ff';
const CYAN_20   = 'rgba(0,209,255,0.20)';
const CYAN_60   = 'rgba(0,209,255,0.60)';
const CYAN_GLOW = 'rgba(0,209,255,0.14)';
const INPUT_BG  = 'rgba(5,12,30,0.75)';
const LABEL_CLR = 'rgba(0,209,255,0.50)';

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showCfm,   setShowCfm]   = useState(false);
  const [focusPwd,  setFocusPwd]  = useState(false);
  const [focusCfm,  setFocusCfm]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Vérifie qu'une session de récupération est bien active
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      if (!session) {
        setTimeout(() => router.replace('/login'), 3000);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.'); return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.'); return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message); return;
      }

      setSuccess(true);

      // Redirige selon le rôle de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setTimeout(() => {
          router.replace(profile?.role === 'societe' ? '/espace-societe/dashboard' : '/agent/hub');
        }, 2000);
      } else {
        setTimeout(() => router.replace('/login'), 2000);
      }
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Session expirée ou absente
  if (hasSession === false) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B1426', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: 'rgba(0,209,255,0.5)', fontSize: 13 }}>
          <p>Lien expiré ou déjà utilisé.</p>
          <p style={{ marginTop: 8, fontSize: 11 }}>Redirection vers la connexion…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 110% 70% at 50% 0%, rgba(0,50,120,0.35) 0%, #0B1426 55%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        color: '#f1f5f9',
        position: 'relative',
      }}
    >
      {/* Grille */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(0,209,255,0.027) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(0,209,255,0.027) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 20%, black, transparent 68%)',
        maskImage: 'radial-gradient(ellipse 85% 70% at 50% 20%, black, transparent 68%)',
      }} />

      {/* Carte */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'rgba(10,20,46,0.72)',
        backdropFilter: 'blur(22px)',
        border: `1px solid ${CYAN_20}`,
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 0 0 1px rgba(0,209,255,0.04),0 30px 80px rgba(0,0,0,0.55)',
      }}>
        {/* Liseré */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,209,255,0.55), transparent)',
          borderRadius: 4,
        }} />

        {success ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#eef4ff', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
              Mot de passe mis à jour
            </h2>
            <p style={{ color: LABEL_CLR, fontSize: 13, lineHeight: 1.6 }}>
              Redirection vers votre espace…
            </p>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '1.5rem', letterSpacing: '2px' }}>
                <span style={{ color: '#fff' }}>Secu</span><span style={{ color: '#00aaff' }}>PRO</span>
              </span>
              <h1 style={{ marginTop: 10, fontSize: 20, fontWeight: 900, color: '#eef4ff' }}>
                Nouveau mot de passe
              </h1>
              <p style={{ marginTop: 4, fontSize: 12, color: LABEL_CLR }}>
                Choisissez un mot de passe sécurisé
              </p>
            </div>

            {/* Séparateur */}
            <div style={{ height: 1, marginBottom: 24, background: 'linear-gradient(90deg, transparent, rgba(0,209,255,0.18), transparent)' }} />

            {/* Erreur */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', fontSize: 12, fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nouveau mot de passe */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em',
                  color: LABEL_CLR,
                }}>
                  <Lock size={10} style={{ color: CYAN }} />
                  Nouveau mot de passe *{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(0,209,255,0.3)' }}>
                    (min. 8 car.)
                  </span>
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', borderRadius: 12,
                  background: INPUT_BG,
                  border: `1px solid ${focusPwd ? CYAN_60 : CYAN_20}`,
                  boxShadow: focusPwd ? `0 0 0 3px ${CYAN_GLOW}` : 'none',
                  transition: 'all 0.2s',
                }}>
                  <Lock size={15} style={{ marginLeft: 14, flexShrink: 0, color: focusPwd ? CYAN : 'rgba(0,209,255,0.3)' }} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusPwd(true)}
                    onBlur={() => setFocusPwd(false)}
                    required disabled={loading}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      padding: '12px', fontSize: 13, fontWeight: 600,
                      color: '#f1f5f9',
                      fontFamily: "var(--font-geist-mono),'Courier New',monospace",
                      letterSpacing: showPwd ? '0.12em' : '0.22em',
                    }}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ marginRight: 12, padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: showPwd ? CYAN : 'rgba(0,209,255,0.3)' }}>
                    {showPwd ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirmer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em',
                  color: LABEL_CLR,
                }}>
                  <Lock size={10} style={{ color: CYAN }} />
                  Confirmer *
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', borderRadius: 12,
                  background: INPUT_BG,
                  border: `1px solid ${confirm && confirm !== password ? 'rgba(239,68,68,0.5)' : focusCfm ? CYAN_60 : CYAN_20}`,
                  boxShadow: focusCfm ? `0 0 0 3px ${CYAN_GLOW}` : 'none',
                  transition: 'all 0.2s',
                }}>
                  <Lock size={15} style={{ marginLeft: 14, flexShrink: 0, color: focusCfm ? CYAN : 'rgba(0,209,255,0.3)' }} />
                  <input
                    type={showCfm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onFocus={() => setFocusCfm(true)}
                    onBlur={() => setFocusCfm(false)}
                    required disabled={loading}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      padding: '12px', fontSize: 13, fontWeight: 600,
                      color: '#f1f5f9',
                      fontFamily: "var(--font-geist-mono),'Courier New',monospace",
                      letterSpacing: showCfm ? '0.12em' : '0.22em',
                    }}
                  />
                  <button type="button" onClick={() => setShowCfm(v => !v)}
                    style={{ marginRight: 12, padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: showCfm ? CYAN : 'rgba(0,209,255,0.3)' }}>
                    {showCfm ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p style={{ fontSize: 10, color: '#ef4444', margin: 0 }}>Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop: 4, width: '100%', padding: '14px',
                borderRadius: 14, border: '1px solid rgba(0,209,255,0.45)',
                background: loading ? '#1a3060' : 'linear-gradient(135deg, #004e9a 0%, #0077cc 55%, #00a8e8 100%)',
                color: '#fff', fontSize: 12, fontWeight: 900,
                letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 30px rgba(0,119,204,0.5)',
              }}>
                {loading ? 'Mise à jour…' : 'Enregistrer le nouveau mot de passe →'}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,209,255,0.1)' }}>
        🔒 Données sécurisées · Hébergement UE · RGPD
      </p>
    </div>
  );
}
