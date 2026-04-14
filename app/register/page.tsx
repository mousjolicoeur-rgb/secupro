'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[SecuPRO] signUp error:', {
          message: error.message,
          status: error.status,
          code: (error as any).code ?? null,
        });
        setError(error.message);
      } else {
        console.info('[SecuPRO] signUp OK — email de confirmation envoyé à', email);
        setRegistrationSuccess(true);
      }
    } catch (err) {
      console.error('[SecuPRO] signUp exception:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ── Écran de confirmation envoyée ──────────────────────────
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-500 tracking-tighter">SECUPRO</h1>
          <p className="text-slate-400 uppercase text-xs tracking-[0.2em]">Système de Gestion Agents</p>
        </div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-white mb-3">Enrôlement initié</h2>
          <p className="text-slate-400 text-sm mb-6">
            Un email de confirmation a été envoyé à{' '}
            <span className="text-cyan-400 font-medium">{email}</span>.<br />
            Cliquez sur le lien pour activer votre accès.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-slate-500">
              Email non reçu ? Vérifiez votre dossier spam ou{' '}
              <button
                onClick={() => setRegistrationSuccess(false)}
                className="text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                recommencez l'inscription
              </button>
              .
            </p>
          </div>

          <Link
            href="/login"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-lg transition-colors text-sm"
          >
            Retour à la connexion
          </Link>

          <p className="text-center text-slate-500 text-xs mt-6">
            🔒 Serveur sécurisé - Protocole de cryptage AES-256
          </p>
        </div>
      </div>
    );
  }

  // ── Formulaire d'inscription ───────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-500 tracking-tighter">SECUPRO</h1>
        <p className="text-slate-400 uppercase text-xs tracking-[0.2em]">Système de Gestion Agents</p>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Créer un compte Agent</h2>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 ml-1">Email professionnel</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 mt-1"
              placeholder="agent@secupro.app"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 ml-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 mt-1"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 ml-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all disabled:opacity-50 mt-1"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
          >
            {loading ? 'Enrôlement en cours...' : 'Démarrer l\'enrôlement'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-cyan-500 hover:text-cyan-400 transition-colors">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-slate-600 text-xs mt-4">
          🔒 Serveur sécurisé - Protocole de cryptage AES-256
        </p>
      </div>
    </div>
  );
}
