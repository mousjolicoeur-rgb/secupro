'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Key, Building2, CheckCircle2, AlertTriangle, ArrowLeft, Loader2, FileText, Calendar, Banknote } from 'lucide-react';
import Link from 'next/link';

export default function PortailProPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [societeNom, setSocieteNom] = useState<string | null>(null);
  
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadAgent() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      
      const { data: agent } = await supabase
        .from('agents')
        .select('id, societes(nom)')
        .eq('email', session.user.email)
        .single();
        
      if (agent) {
        setAgentId(agent.id);
        if (agent.societes) {
          // Déjà rattaché
          setSocieteNom(agent.societes.nom);
        }
      }
      setLoading(false);
    }
    loadAgent();
  }, [router]);

  const handleRattachement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !agentId) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/portail/rattacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), agentId })
      });
      
      const result = await res.json();
      
      if (result.success) {
        setSuccess(`Félicitations, vous êtes désormais rattaché à ${result.nomSociete} !`);
        setSocieteNom(result.nomSociete);
      } else {
        setError(result.error || "Le code est invalide.");
      }
    } catch (err) {
      setError("Une erreur de connexion est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D18] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#3B82F6]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D18] text-white font-sans p-6 pb-24">
      <div className="max-w-xl mx-auto pt-4">
        <button
          onClick={() => router.push('/agent/hub')}
          className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest mb-8 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Hub
        </button>

        <div className="mb-10">
          <p className="text-[10px] text-[#3B82F6] uppercase tracking-[0.3em] font-bold mb-1">
            Connexion Entreprise
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
            PORTAIL <span className="text-[#3B82F6]">PRO</span>
          </h1>
        </div>

        {societeNom ? (
          /* ── ÉCRAN AGENT RATTACHÉ ── */
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-[#0b1426] border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
              {/* Liseré lumineux */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
              
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-[#3B82F6]/20 border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
                <Building2 size={36} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0b1426] rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Rattachement Actif</h2>
              <div className="text-sm font-bold bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-emerald-400 uppercase tracking-widest mb-4">
                {societeNom}
              </div>
              
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Vous avez accès en temps réel aux données RH et opérationnelles transmises par votre société.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/agent/planning" className="bg-[#0b1426] border border-white/5 hover:border-[#3B82F6]/50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Plannings</span>
              </Link>
              <Link href="/agent/paie" className="bg-[#0b1426] border border-white/5 hover:border-[#3B82F6]/50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Banknote size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Fiches de Paie</span>
              </Link>
              <Link href="/agent/docs" className="bg-[#0b1426] border border-white/5 hover:border-[#3B82F6]/50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors group col-span-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Documents RH & Contrats</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── ÉCRAN SAISIE CODE INVITATION ── */
          <div className="bg-[#0b1426] border border-white/5 rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                <Key size={28} />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-white mb-2">Code d'invitation</h2>
            <p className="text-xs text-slate-400 text-center mb-8 max-w-xs mx-auto leading-relaxed">
              Demandez le code d'invitation à votre entreprise pour synchroniser votre compte SecuPRO avec leur système.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-semibold">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleRattachement} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">
                  Code à 6 caractères
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: SEC-4X7K"
                  maxLength={8}
                  className="w-full bg-[#060D18] border-2 border-white/10 rounded-2xl px-6 py-4 text-center text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-[#3B82F6] transition-colors tracking-widest uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || code.length < 6}
                className="w-full py-4 rounded-2xl bg-[#3B82F6] text-white text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/80 transition-all disabled:opacity-50 disabled:hover:bg-[#3B82F6] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Validation...</>
                ) : (
                  <><Building2 size={16} /> Valider le rattachement</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
