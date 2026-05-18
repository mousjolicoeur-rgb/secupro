'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      router.replace('/login?error=confirmation_failed');
      return;
    }

    // Listener AVANT l'échange de code pour capturer le type d'événement Supabase.
    // PASSWORD_RECOVERY → page de saisie du nouveau mot de passe.
    // SIGNED_IN          → redirection vers le dashboard selon le rôle.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      subscription.unsubscribe();

      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/auth/update-password');
        return;
      }

      if (session) {
        // Détermine la destination selon le rôle enregistré en base
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'societe') {
          router.replace('/espace-societe/dashboard');
        } else {
          router.replace('/agent/hub');
        }
        return;
      }

      router.replace('/login');
    });

    const code = searchParams?.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          subscription.unsubscribe();
          router.replace('/login?error=confirmation_failed');
        }
      });
    } else {
      // Pas de code — timeout de sécurité si onAuthStateChange ne se déclenche pas
      const t = setTimeout(() => {
        subscription.unsubscribe();
        router.replace('/login');
      }, 5000);
      return () => clearTimeout(t);
    }

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0B1426',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: '#00d1ff', borderRightColor: 'rgba(0,209,255,0.3)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: 'rgba(0,209,255,0.5)', fontSize: 13, letterSpacing: '0.05em' }}>
        Vérification en cours…
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0B1426', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0,209,255,0.3)', borderTopColor: '#00d1ff', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
