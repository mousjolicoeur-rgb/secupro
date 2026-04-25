'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Key, Copy, Check, Users, ShieldAlert, Loader2, UserMinus, Shield } from 'lucide-react';
import DownloadTemplate from '@/components/dashboard/DownloadTemplate';

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
};

export default function AgentsDashboardPage() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [societeId, setSocieteId] = useState<string | null>(null);
  
  const [attachedAgents, setAttachedAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Récupérer la société de l'exploitant
      const { data: soc } = await supabase.from('societes').select('*').limit(1).single();
      if (soc) {
        setSocieteId(soc.id);
        if (soc.code_invitation) {
          setCode(soc.code_invitation);
          setExpiresAt(soc.code_expire_at);
        }
        
        // 2. Charger les agents rattachés à cette société
        const { data: agents } = await supabase
          .from('agents')
          .select('id, nom, prenom, email, statut')
          .eq('societe_id', soc.id)
          .order('nom', { ascending: true });
          
        if (agents) {
          setAttachedAgents(agents as Agent[]);
        }
      }
      setLoadingAgents(false);
    }
    loadData();
  }, []);

  const generateCode = async () => {
    if (!societeId) return;
    setLoading(true);
    
    // Génère un code type SEC-4X7
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newCode = `SEC-${randomChars}`;
    
    // Expire dans 48h
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 48);

    const { error } = await supabase
      .from('societes')
      .update({ 
        code_invitation: newCode, 
        code_expire_at: expireDate.toISOString() 
      })
      .eq('id', societeId);

    if (!error) {
      setCode(newCode);
      setExpiresAt(expireDate.toISOString());
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const revokeCode = async () => {
    if (!societeId) return;
    setLoading(true);
    await supabase
      .from('societes')
      .update({ code_invitation: null, code_expire_at: null })
      .eq('id', societeId);
    setCode(null);
    setExpiresAt(null);
    setLoading(false);
  };

  const revokeAgent = async (agentId: string) => {
    if (!confirm("Voulez-vous vraiment révoquer l'accès de cet agent à votre portail ?")) return;
    
    // On détache l'agent en mettant societe_id à null
    const { error } = await supabase
      .from('agents')
      .update({ societe_id: null })
      .eq('id', agentId);
      
    if (!error) {
      setAttachedAgents(prev => prev.filter(a => a.id !== agentId));
    } else {
      alert("Erreur lors de la révocation de l'agent.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            SecuPRO - Gestion Agents
          </h1>
          <p className="text-slate-500">Gérez vos effectifs, vos imports et les accès au portail B2B.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Portail Pro / Invitation ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portail Pro (Agent)</h2>
                <p className="text-sm text-slate-500">Générez un code pour rattacher un agent.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              {code ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-[0.2em] bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm flex-1 text-center">
                      {code}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {copied ? <Check className="text-emerald-500" /> : <Copy />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Expire le {expiresAt && new Date(expiresAt).toLocaleString('fr-FR')}
                    </span>
                    <button 
                      onClick={revokeCode} disabled={loading}
                      className="text-red-500 hover:text-red-600 font-semibold"
                    >
                      {loading ? 'Révocation...' : 'Révoquer ce code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-6">
                  <ShieldAlert className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 mb-4">Aucun code actif actuellement.</p>
                  <button
                    onClick={generateCode}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                    Générer un code d'invitation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Liste des agents rattachés ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agents Rattachés</h2>
                  <p className="text-sm text-slate-500">Ont accès à votre portail B2B.</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300">
                {attachedAgents.length} agent(s)
              </div>
            </div>

            <div className="space-y-3">
              {loadingAgents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-slate-400" size={24} />
                </div>
              ) : attachedAgents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  Aucun agent n'est actuellement rattaché à votre société.
                </div>
              ) : (
                attachedAgents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{agent.prenom} {agent.nom}</p>
                      <p className="text-xs text-slate-500">{agent.email}</p>
                    </div>
                    <button 
                      onClick={() => revokeAgent(agent.id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors tooltip"
                      title="Révoquer l'accès"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Provisioning CSV ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
           <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Effectifs & Provisioning</h2>
              <p className="text-sm text-slate-500">Import en masse via CSV ou ajout manuel (back-office).</p>
            </div>
          </div>
          <DownloadTemplate />
        </div>

      </div>
    </div>
  );
}
