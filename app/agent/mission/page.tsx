'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRapport } from '@/services/rapportService';

export default function MissionPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [nom, setNom] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setNom(localStorage.getItem('entreprise_nom') || 'Inconnue');
    setId(localStorage.getItem('entreprise_id') || '');
  }, []);

  // 🚨 LE NOUVEAU BOUCLIER : Au lieu de "null", on donne une vraie page de chargement à Next.js
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex flex-col items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse font-bold tracking-widest uppercase">Initialisation GPS...</p>
      </div>
    );
  }

  const alerterPC = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await createRapport(
        'ALERTE URGENCE',
        "Bouton panique activé par l'agent",
        pos.coords.latitude,
        pos.coords.longitude,
        id
      );
      if (error) {
        alert("Erreur d'envoi du signal. Réessayez.");
        return;
      }
      router.push('/dashboard');
    });
  };

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white p-6 flex flex-col items-center justify-center">
      <p className="text-gray-400 mb-2">ENTREPRISE : <span className="text-[#00D1FF]">{nom}</span></p>
      
      <button 
        onClick={alerterPC}
        className="w-64 h-64 bg-red-600 rounded-full border-8 border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.4)] active:scale-90 transition-all flex flex-col items-center justify-center"
      >
        <span className="text-6xl mb-2">🚨</span>
        <span className="font-black text-xl">ALERTE PC</span>
      </button>

      <p className="mt-10 text-xs text-gray-500 italic text-center">
        Votre position GPS est transmise en temps réel <br/> au Dashboard de {nom}.
      </p>
    </div>
  );
}