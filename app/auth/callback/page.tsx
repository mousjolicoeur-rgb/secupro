'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  const redirectByRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (['societe','manager','admin'].includes(profile?.role)) {
      router.replace('/espace-societe/dashboard');
    } else {
      router.replace('/agent/hub');
    }
  };

  useEffect(() => {
    const handle = async () => {
      const errorParam = searchParams?.get('error');
      if (errorParam) { router.replace('/login?error=confirmation_failed'); return; }
      const code = searchParams?.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { router.replace('/login?error=confirmation_failed'); return; }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { await redirectByRole(); return; }
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
        if (s) { subscription.unsubscribe(); await redirectByRole(); }
      });
      setTimeout(() => { subscription.unsubscribe(); router.replace('/login'); }, 5000);
    };
    handle();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="text-center">
        {error ? <p className="text-red-400">{error}</p> : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
