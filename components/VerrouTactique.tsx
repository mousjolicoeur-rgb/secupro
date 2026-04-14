"use client";

import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function VerrouTactique({ children, estBloque }: { children: React.ReactNode, estBloque: boolean }) {
  
  if (estBloque) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-4 border-amber-500 bg-slate-900 p-8 my-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 rounded-full bg-amber-500 text-black shadow-lg animate-bounce">
            <Lock size={32} />
          </div>
          <h2 className="text-amber-500 text-2xl font-black uppercase tracking-tighter mb-2">
            Accès Premium Requis
          </h2>
          <p className="text-white text-sm mb-6 max-w-md">
            Mustapha, ce module est réservé aux agents Premium. 
            Débloquez tout pour <span className="font-bold text-amber-400 text-lg">9.99€/mois</span>.
          </p>
          <Link 
            href="/abonnement" 
            className="bg-amber-500 hover:bg-amber-400 text-black px-10 py-4 rounded-full font-black uppercase transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          >
            S'abonner maintenant
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}