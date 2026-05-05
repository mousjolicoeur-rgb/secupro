'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, RefreshCw, BadgeCheck, Newspaper, Scale, Briefcase, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Actu = {
  id: string;
  categorie: 'cnaps' | 'conv' | 'emploi';
  titre: string;
  resume: string;
  contenu: string;
  source: string;
  url?: string;
  created_at: string;
  date_publication?: string;
};

const CATEGORIES = [
  { id: 'all', label: 'Toutes les actualités', Icon: Newspaper },
  { id: 'cnaps', label: 'CNAPS', Icon: BadgeCheck },
  { id: 'conv', label: 'Convention collective', Icon: Scale },
  { id: 'emploi', label: 'Emploi', Icon: Briefcase },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function isNew(iso: string): boolean {
  const diff = Date.now() - new Date(iso).getTime();
  return diff < 24 * 3600 * 1000; // 24 hours
}

export default function ActualitesPage() {
  const router = useRouter();
  const [actus, setActus] = useState<Actu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const loadActus = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('actualites')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setActus((data as Actu[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des actualités");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActus();
  }, []);

  const filteredActus = selectedCat === 'all' 
    ? actus 
    : actus.filter(a => a.categorie === selectedCat);

  return (
    <div className="min-h-screen bg-[#060D18] text-white flex flex-col pb-12">
      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6 border-b border-white/5 bg-gradient-to-b from-[#0a1426] to-transparent">
        <button
          onClick={() => router.push('/agent/hub')}
          className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Hub
        </button>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#3B82F6] uppercase tracking-[0.3em] font-bold mb-1">
              Veille réglementaire
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
              ACTU <span className="text-[#3B82F6]">SÉCU</span>
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 font-semibold">
              Les dernières informations officielles et nouveautés du secteur
            </p>
          </div>

          <button
            onClick={() => loadActus(true)}
            disabled={refreshing || loading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:border-[#3B82F6]/50 hover:text-white hover:bg-[#3B82F6]/10 transition-all disabled:opacity-40"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
        
        {/* Category Filters */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-6 pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:border-[#3B82F6]/30 hover:text-white'
              }`}
            >
              <cat.Icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 mt-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="text-[#3B82F6] animate-spin" size={32} />
            <p className="text-[#3B82F6] text-sm font-bold uppercase tracking-widest">Chargement des actualités...</p>
          </div>
        ) : filteredActus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Newspaper className="text-slate-700" size={48} />
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActus.map((actu) => {
              const dateRef = actu.date_publication || actu.created_at;
              const isRecent = isNew(dateRef);
              const catObj = CATEGORIES.find(c => c.id === actu.categorie) || CATEGORIES[0];
              const targetUrl = actu.url || '#';

              return (
                <div 
                  key={actu.id}
                  className="flex flex-col rounded-2xl bg-[#0b1426] border border-white/5 hover:border-[#3B82F6]/30 transition-colors overflow-hidden group"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header: Date + Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <CalendarDays size={12} />
                        <span>{formatDate(dateRef)}</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {/* Category Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                          {catObj.label}
                        </span>
                        
                        {/* 24h Badge */}
                        {isRecent && (
                          <span className="px-2 py-0.5 rounded-md bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[9px] font-black uppercase tracking-widest text-[#3B82F6] animate-pulse">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-black text-lg leading-tight mb-2 group-hover:text-[#3B82F6] transition-colors">
                      {actu.titre}
                    </h3>
                    
                    {/* Source */}
                    {actu.source && (
                      <p className="text-[#3B82F6] text-xs font-bold mb-3 uppercase tracking-wider">
                        Source : {actu.source}
                      </p>
                    )}

                    {/* Summary */}
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {actu.resume || actu.contenu}
                    </p>

                    {/* Read More Button */}
                    <a 
                      href={targetUrl}
                      target={actu.url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6] group-hover:text-white transition-all active:scale-95"
                    >
                      Lire l'article <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
