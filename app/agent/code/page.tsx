'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Scale, BadgeCheck, Clock, Banknote, AlertTriangle, CalendarDays, X, Loader2, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type ArticleDroit = {
  id: string;
  numero_article: string;
  titre: string;
  resume: string;
  contenu: string;
  categorie: string;
};

const CATEGORIES = [
  { id: 'all', label: 'Tous les textes', Icon: BookOpen },
  { id: 'idcc_1351', label: 'IDCC 1351', Icon: Scale },
  { id: 'cnaps', label: 'CNAPS', Icon: BadgeCheck },
  { id: 'temps_travail', label: 'Temps de travail', Icon: Clock },
  { id: 'salaire', label: 'Salaire & Primes', Icon: Banknote },
  { id: 'disciplinaire', label: 'Disciplinaire', Icon: AlertTriangle },
  { id: 'conges', label: 'Congés', Icon: CalendarDays },
];

const CACHE_KEY = 'secudroit_articles_cache';

export default function SecuDroitPage() {
  const router = useRouter();
  
  const [articles, setArticles] = useState<ArticleDroit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  
  // Modal state
  const [selectedArticle, setSelectedArticle] = useState<ArticleDroit | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      // 1. Try Cache First (Offline Support)
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setArticles(JSON.parse(cached));
        setLoading(false);
      }

      // 2. Fetch from Supabase (Network)
      try {
        const { data, error } = await supabase
          .from('articles_droit')
          .select('*')
          .order('categorie', { ascending: true })
          .order('numero_article', { ascending: true });

        if (!error && data) {
          setArticles(data as ArticleDroit[]);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.error('[SecuDroit] Error fetching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    
    // Filtre Catégorie
    if (selectedCat !== 'all') {
      result = result.filter(a => a.categorie === selectedCat);
    }
    
    // Filtre Recherche
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(a => 
        a.titre.toLowerCase().includes(lowerSearch) || 
        a.contenu.toLowerCase().includes(lowerSearch) ||
        a.numero_article.toLowerCase().includes(lowerSearch)
      );
    }
    
    return result;
  }, [articles, selectedCat, search]);

  const getCategoryMeta = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-[#060D18] text-white flex flex-col pb-12 font-sans">
      
      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6 border-b border-white/5 bg-gradient-to-b from-[#0a1426] to-transparent sticky top-0 z-20 backdrop-blur-md">
        <button
          onClick={() => router.push('/agent/hub')}
          className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Hub
        </button>

        <div>
          <p className="text-[10px] text-[#3B82F6] uppercase tracking-[0.3em] font-bold mb-1">
            Documentation Juridique
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
            SECU<span className="text-[#3B82F6]">DROIT</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 font-semibold">
            Vos droits, la convention collective et le code de sécurité intérieure.
          </p>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative mt-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article, un mot clé (ex: panier, nuit, prime...)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/50 transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Category Filters ── */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pb-2">
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
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="text-[#3B82F6] animate-spin" size={32} />
            <p className="text-[#3B82F6] text-sm font-bold uppercase tracking-widest">Chargement des textes...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Scale className="text-slate-700" size={48} />
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((art) => {
              const catMeta = getCategoryMeta(art.categorie);
              return (
                <div 
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="group flex flex-col rounded-2xl bg-[#0b1426] border border-white/5 p-5 cursor-pointer hover:border-[#3B82F6]/40 hover:bg-[#0f1b33] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2 py-1 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest">
                      {art.numero_article}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                      <catMeta.Icon size={10} />
                      {catMeta.label}
                    </div>
                  </div>
                  
                  <h3 className="text-white font-black text-base leading-tight mb-2 group-hover:text-[#3B82F6] transition-colors">
                    {art.titre}
                  </h3>
                  
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mt-auto">
                    {art.resume || art.contenu}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Détail Article ── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div 
            className="absolute inset-0 bg-[#060D18]/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedArticle(null)}
          />
          <div 
            className="relative w-full sm:w-[600px] max-h-[90vh] sm:max-h-[85vh] bg-[#0b1426] border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-3xl">
              <div>
                <span className="px-2 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                  {selectedArticle.numero_article}
                </span>
                <h2 className="text-xl font-black text-white leading-tight">
                  {selectedArticle.titre}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 ml-4"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 text-sm leading-relaxed text-slate-300">
              <div className="flex items-center gap-2 text-[#3B82F6] text-xs font-bold uppercase tracking-widest mb-6 bg-[#3B82F6]/10 p-3 rounded-xl border border-[#3B82F6]/20">
                {(() => {
                  const Icon = getCategoryMeta(selectedArticle.categorie).Icon;
                  return <Icon size={14} />;
                })()}
                {getCategoryMeta(selectedArticle.categorie).label}
              </div>

              {selectedArticle.resume && (
                <p className="font-semibold text-white mb-5 text-base">
                  {selectedArticle.resume}
                </p>
              )}
              
              <div className="whitespace-pre-wrap text-slate-400">
                {selectedArticle.contenu}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0b1426] sm:rounded-b-3xl">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-full py-3.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6] hover:text-white transition-colors active:scale-[0.98]"
              >
                Fermer l'article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles globaux pour la scrollbar du modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59,130,246,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59,130,246,0.5);
        }
      `}} />
    </div>
  );
}
