'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

function LoginContent() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const router       = useRouter();
  const searchParams = useSearchParams();
  const errorParam   = searchParams.get('error');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else { router.replace('/dashboard'); }
    } catch { setError('Une erreur est survenue. Réessayez.'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Entrez votre email pour réinitialiser.'); return; }
    setLoading(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback`,
    });
    setLoading(false);
    if (error) { setError(error.message); }
    else { setResetSent(true); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(7,13,26,0.8)',
    border: '1px solid rgba(26,111,212,0.25)', borderRadius: 10,
    padding: '11px 14px', color: '#eef4ff', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.1em',
    color: '#5a7a9f', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg,#020c1b,#04182e,#061f3d,#020e21)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI','Trebuchet MS',sans-serif" }}>

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,209,255,0.05), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/secupro-logo-official.png" alt="SecuPRO" width={56} height={56} style={{ margin: '0 auto 8px', filter: 'drop-shadow(0 0 16px rgba(0,209,255,0.3))' }} />
          <p style={{ color: 'rgba(0,209,255,0.5)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3em' }}>
            Gestion opérationnelle · Sécurité privée
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(13,24,48,0.95)', border: '1px solid rgba(26,111,212,0.25)', borderRadius: 20, padding: 32, backdropFilter: 'blur(12px)' }}>

          {resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <h2 style={{ color: '#eef4ff', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Email envoyé</h2>
              <p style={{ color: '#5a7a9f', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Un lien de réinitialisation a été envoyé à <strong style={{ color: '#2b8fff' }}>{email}</strong>.
              </p>
              <button onClick={() => { setResetSent(false); setShowReset(false); }} style={{ color: '#2b8fff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ color: '#eef4ff', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                {showReset ? 'Réinitialiser le mot de passe' : 'Connexion à votre espace'}
              </h1>
              <p style={{ color: '#5a7a9f', fontSize: 13, marginBottom: 24 }}>
                {showReset ? 'Entrez votre email pour recevoir un lien.' : 'Accédez à votre dashboard SecuPRO.'}
              </p>

              {/* Errors */}
              {(errorParam === 'confirmation_failed') && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13 }}>
                  La confirmation email a échoué. Réessayez.
                </div>
              )}
              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <form onSubmit={showReset ? handleReset : handleSignIn}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email professionnel *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} placeholder="contact@masociete.fr" style={inputStyle} />
                </div>

                {!showReset && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe *</label>
                      <button type="button" onClick={() => { setShowReset(true); setError(''); }} style={{ fontSize: 11, color: '#2b8fff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder="••••••••" style={inputStyle} />
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: 14, borderRadius: 12, border: 'none',
                  background: loading ? '#1a3060' : 'linear-gradient(135deg,#1a6fd4,#2b8fff)',
                  color: '#fff', fontSize: 14, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '.15em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 24px rgba(26,111,212,0.4)',
                }}>
                  {loading ? '⏳ En cours…' : showReset ? '📧 Envoyer le lien' : '🔐 Se connecter'}
                </button>

                {showReset && (
                  <button type="button" onClick={() => { setShowReset(false); setError(''); }} style={{ width: '100%', marginTop: 10, padding: '11px', borderRadius: 12, border: '1px solid rgba(26,111,212,0.25)', background: 'transparent', color: '#2b8fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ← Retour à la connexion
                  </button>
                )}
              </form>

              {!showReset && (
                <p style={{ textAlign: 'center', color: '#3a5a7a', fontSize: 12, marginTop: 18 }}>
                  Pas encore de compte ?{' '}
                  <Link href="/register" style={{ color: '#2b8fff', fontWeight: 700, textDecoration: 'none' }}>
                    Essai gratuit 7 jours →
                  </Link>
                </p>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(90,122,159,0.35)', fontSize: 11, marginTop: 16 }}>
          🔒 Données sécurisées · Hébergement UE · RGPD
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#5a7a9f', fontSize: 13 }}>Chargement…</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
