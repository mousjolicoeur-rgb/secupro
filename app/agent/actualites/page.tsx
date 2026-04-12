'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, RefreshCw,
  BadgeCheck, Newspaper, Scale, Wrench, Zap,
} from 'lucide-react';
import type { ChannelPayload, ArticlePayload } from '@/app/api/actualites/feeds/route';

// ─── Couleurs SecuPRO ─────────────────────────────────────────────────────────
const CYAN  = '#22d3ee';   // titres des blocs
const GOLD  = '#fbbf24';   // badges NOUVEAU

// ─── Config des canaux (icône, accent, badge officiel) ────────────────────────
const CHANNEL_META: Record<string, {
  label: string;
  subtitle: string;
  Icon: React.ElementType;
  accentHex: string;
  official?: boolean;
}> = {
  cnaps:  { label: 'Alertes CNAPS & Carte Pro',      subtitle: 'Source officielle CNAPS',    Icon: BadgeCheck, accentHex: '#FFD700', official: true },
  legal:  { label: 'Convention Collective & Décrets', subtitle: 'IDCC 1351 — Sécurité Privée', Icon: Scale,      accentHex: '#60a5fa' },
  metier: { label: 'Équipements & Innovations',       subtitle: 'Veille technologique secteur', Icon: Wrench,     accentHex: '#34d399' },
  flash:  { label: 'Flash Info Secteur',              subtitle: 'Actualités rapides & alertes', Icon: Zap,        accentHex: '#f87171' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Header skeleton */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] animate-pulse shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-2.5 bg-white/[0.08] rounded-full animate-pulse w-3/4" />
            <div className="h-2 bg-white/[0.05] rounded-full animate-pulse w-1/2" />
          </div>
        </div>
      </div>
      {/* Articles skeleton × 3 */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-4 py-3.5 space-y-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="h-2 bg-white/[0.06] rounded-full animate-pulse w-1/3" />
          <div className="h-3 bg-white/[0.09] rounded-full animate-pulse w-full" style={{ animationDelay: `${i * 80}ms` }} />
          <div className="h-2 bg-white/[0.05] rounded-full animate-pulse w-5/6" style={{ animationDelay: `${i * 80 + 40}ms` }} />
          <div className="h-2 bg-white/[0.05] rounded-full animate-pulse w-4/6" style={{ animationDelay: `${i * 80 + 80}ms` }} />
        </div>
      ))}
      {/* Footer skeleton */}
      <div className="px-4 py-3">
        <div className="h-7 bg-white/[0.05] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ─── Article row ─────────────────────────────────────────────────────────────
function ArticleRow({ art, accentHex }: { art: ArticlePayload; accentHex: string }) {
  const [hovered, setHovered] = useState(false);
  const isDead = !art.url || art.url === '#';

  return (
    <div className="px-4 py-3.5">
      {/* Date + badge NOUVEAU */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
          {formatDate(art.date)}
        </span>
        {art.isNew && (
          <span
            className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
            style={{
              background: `${GOLD}22`,
              color: GOLD,
              boxShadow: `0 0 8px ${GOLD}44`,
            }}
          >
            NOUVEAU
          </span>
        )}
      </div>

      {/* Titre */}
      <p className="text-white text-xs font-black leading-snug mb-1">{art.title}</p>

      {/* Résumé */}
      <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-3">{art.summary}</p>

      {/* CTA LIRE LA SUITE */}
      {isDead ? (
        <span
          className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-default opacity-30"
          style={{ color: accentHex }}
        >
          LIRE LA SUITE <ExternalLink size={9} />
        </span>
      ) : (
        <a
          href={art.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-200"
          style={{
            color:      hovered ? CYAN : accentHex,
            textShadow: hovered ? `0 0 10px ${CYAN}99` : 'none',
          }}
        >
          LIRE LA SUITE <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ payload }: { payload: ChannelPayload }) {
  const meta = CHANNEL_META[payload.key];
  if (!meta) return null;
  const { label, subtitle, Icon, accentHex, official } = meta;
  const [hover, setHover] = useState(false);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(15,23,42,0.55)',
        border: `1px solid ${hover ? accentHex + '55' : accentHex + '28'}`,
        boxShadow: hover ? `0 0 32px ${accentHex}22, 0 0 0 1px ${accentHex}35` : 'none',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ── En-tête canal ── */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${accentHex}18` }}>
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{ background: `${accentHex}18`, border: `1px solid ${accentHex}35` }}
          >
            <Icon size={17} style={{ color: accentHex }} />
          </div>
          <div className="flex items-center gap-1.5">
            {payload.source === 'rss' && (
              <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
                LIVE
              </span>
            )}
            {official && (
              <span
                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{ color: accentHex, borderColor: `${accentHex}50`, background: `${accentHex}15` }}
              >
                OFFICIEL
              </span>
            )}
          </div>
        </div>
        {/* Titre du bloc en CYAN unifié */}
        <p
          className="mt-3 text-[11px] font-black uppercase tracking-widest leading-tight"
          style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}55` }}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
          {subtitle}
        </p>
      </div>

      {/* ── Articles ── */}
      <div className="flex-1 divide-y" style={{ borderColor: `${accentHex}10` }}>
        {payload.articles.map((art) => (
          <ArticleRow key={art.id} art={art} accentHex={accentHex} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${accentHex}15` }}>
        <button
          className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
          style={{ color: accentHex, border: `1px solid ${accentHex}35`, background: `${accentHex}08` }}
        >
          Voir toutes les actualités →
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ActualitesPage() {
  const router = useRouter();
  const [channels, setChannels]       = useState<ChannelPayload[] | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError]             = useState(false);

  // Cache client-side : ne pas refetcher si déjà chargé dans la session
  const sessionCache = useRef<{ data: ChannelPayload[]; at: number } | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('entreprise_id');
    if (!id) { router.push('/agent'); return; }
    void loadFeeds(false);
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFeeds = async (forceRefresh = false) => {
    // Cache client : 5 min
    if (!forceRefresh && sessionCache.current && Date.now() - sessionCache.current.at < 5 * 60 * 1000) {
      setChannels(sessionCache.current.data);
      setLastUpdated(new Date(sessionCache.current.at));
      setLoading(false);
      return;
    }

    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError(false);

    try {
      const res  = await fetch('/api/actualites/feeds', { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { channels: ChannelPayload[]; cachedAt: string };
      sessionCache.current = { data: json.channels, at: Date.now() };
      setChannels(json.channels);
      setLastUpdated(new Date());
    } catch {
      setError(true);
      // Fallback : données déjà chargées ou null → les skeleton restent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const CHANNEL_KEYS = ['cnaps', 'legal', 'metier', 'flash'];

  return (
    <div className="min-h-screen bg-[#060D18] text-white flex flex-col pb-12">

      {/* Fond ambiance */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6">
        <button
          onClick={() => router.push('/agent/hub')}
          className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Hub
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mb-1">
              SecuPRO — Veille réglementaire
            </p>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tighter"
              style={{
                color: '#FFD700',
                textShadow: '0 0 24px rgba(255,215,0,0.55), 0 0 48px rgba(255,215,0,0.25)',
              }}
            >
              ACTUALITÉS <span className="text-white">SecuPRO</span>
            </h1>
            <p className="mt-1.5 text-sm text-emerald-400 font-semibold">
              Veille réglementaire et informations officielles du secteur
            </p>
          </div>

          <button
            onClick={() => void loadFeeds(true)}
            disabled={refreshing || loading}
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white transition-all disabled:opacity-40 mt-1"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {lastUpdated && (
          <p className="mt-3 text-[9px] text-slate-700 uppercase tracking-widest font-bold">
            Mis à jour le {lastUpdated.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* ── Erreur réseau ── */}
      {error && !loading && (
        <div className="mx-4 mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 font-semibold">
          ⚠️ Impossible de joindre le serveur — contenu de secours affiché.
        </div>
      )}

      {/* ── Grille ── */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? CHANNEL_KEYS.map((k) => <SkeletonCard key={k} />)
          : (channels ?? []).map((ch) => <NewsCard key={ch.key} payload={ch} />)
        }
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-center pt-10 pb-2 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <Newspaper size={11} className="text-slate-600" />
          <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
            Sources : CNAPS · Légifrance · InfoProtection · SecuPRO — à titre informatif
          </span>
        </div>
      </div>
    </div>
  );
}
