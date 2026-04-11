'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TILES = [
  {
    href: '/agent/mission',
    icon: '🚨',
    label: 'Mission',
    sub: 'Bouton panique & alerte',
    color: 'from-red-600/40 to-red-900/40',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.25)]',
    accent: 'text-red-400',
  },
  {
    href: '/agent/planning',
    icon: '📅',
    label: 'Planning',
    sub: 'Vos vacations',
    color: 'from-cyan-600/40 to-cyan-900/40',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_24px_rgba(0,209,255,0.2)]',
    accent: 'text-cyan-400',
  },
  {
    href: '/agent/paie',
    icon: '💶',
    label: 'Paie & Budget',
    sub: 'Fiches de salaire',
    color: 'from-emerald-600/40 to-emerald-900/40',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.2)]',
    accent: 'text-emerald-400',
  },
  {
    href: '/agent/docs',
    icon: '📂',
    label: 'Espace Pro',
    sub: 'Carte CNAPS & diplômes',
    color: 'from-violet-600/40 to-violet-900/40',
    border: 'border-violet-500/30',
    glow: 'shadow-[0_0_24px_rgba(139,92,246,0.2)]',
    accent: 'text-violet-400',
  },
  {
    href: '/agent/droits',
    icon: '⚖️',
    label: 'Mes Droits',
    sub: 'SecuDroit — CCN Sécurité',
    color: 'from-amber-600/40 to-amber-900/40',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.2)]',
    accent: 'text-amber-400',
  },
  {
    href: null,
    icon: '🔒',
    label: 'Déconnexion',
    sub: 'Quitter la session',
    color: 'from-gray-700/40 to-gray-900/40',
    border: 'border-gray-600/30',
    glow: '',
    accent: 'text-gray-500',
    isLogout: true,
  },
];

export default function HubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [nom, setNom] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setNom(localStorage.getItem('entreprise_nom') || 'Votre Entreprise');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('entreprise_id');
    localStorage.removeItem('entreprise_nom');
    router.push('/agent');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse font-bold tracking-widest uppercase text-sm">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-6">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-1">
          Agent connecté
        </p>
        <h1 className="text-[#00D1FF] text-3xl font-black tracking-tighter">
          SECUPRO <span className="text-white">HUB</span>
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
            {nom}
          </span>
        </div>
      </div>

      {/* Tiles grid */}
      <div className="flex-1 px-4 pb-10 grid grid-cols-2 gap-3 content-start">
        {TILES.map((tile) => {
          const isLarge = tile.label === 'Mission';
          const baseClass = `
            col-span-${isLarge ? '2' : '1'}
            relative flex flex-col justify-between
            rounded-2xl border ${tile.border}
            bg-gradient-to-br ${tile.color}
            backdrop-blur-md
            p-5 cursor-pointer
            active:scale-95 transition-all duration-150
            ${tile.glow}
          `;

          if (tile.isLogout) {
            return (
              <button
                key={tile.label}
                onClick={handleLogout}
                className={baseClass}
              >
                <span className="text-3xl mb-3">{tile.icon}</span>
                <div>
                  <p className={`font-black text-sm uppercase tracking-wider ${tile.accent}`}>
                    {tile.label}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{tile.sub}</p>
                </div>
              </button>
            );
          }

          return (
            <button
              key={tile.label}
              onClick={() => tile.href && router.push(tile.href)}
              className={baseClass + (isLarge ? ' min-h-[110px]' : ' min-h-[120px]')}
            >
              {isLarge && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-red-500/10" />
                </div>
              )}
              <span className={`${isLarge ? 'text-5xl' : 'text-3xl'} mb-3`}>{tile.icon}</span>
              <div>
                <p className={`font-black ${isLarge ? 'text-base' : 'text-sm'} uppercase tracking-wider ${tile.accent}`}>
                  {tile.label}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">{tile.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-gray-700 text-[10px] text-center pb-6 uppercase tracking-widest font-bold">
        © 2026 SECUPRO COMMAND SYSTEM
      </p>
    </div>
  );
}
