'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DROITS = [
  {
    categorie: 'Salaire & Primes',
    icon: '💶',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    articles: [
      {
        titre: 'Salaire minimum conventionnel',
        corps: 'Le salaire minimum est fixé par coefficient selon la CCN des entreprises de prévention et de sécurité. Il est supérieur au SMIC légal et révisé chaque année lors des négociations de branche.',
      },
      {
        titre: 'Prime d\'ancienneté',
        corps: '+3% après 3 ans, +6% après 6 ans, +9% après 9 ans, +12% après 12 ans, +15% après 15 ans. Calculée sur le salaire minimum conventionnel du coefficient, versée mensuellement.',
      },
      {
        titre: 'Heures supplémentaires',
        corps: 'Majoration de 25% pour les 8 premières heures au-delà de 35h/semaine, puis 50% au-delà. Ces heures peuvent être récupérées sous forme de repos compensateur.',
      },
      {
        titre: 'Bulletin de paie',
        corps: 'L\'employeur doit remettre un bulletin de paie à chaque versement. Il doit mentionner : identité employeur/salarié, coefficient, salaire de base, heures travaillées, primes, cotisations et salaire net.',
      },
    ],
  },
  {
    categorie: 'Temps de travail',
    icon: '⏱️',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    articles: [
      {
        titre: 'Durée légale',
        corps: '35 heures par semaine. La durée maximale est de 48h/semaine et 44h en moyenne sur 12 semaines consécutives.',
      },
      {
        titre: 'Repos entre postes',
        corps: '11 heures consécutives minimum entre deux postes. Ce repos est obligatoire et ne peut être réduit qu\'exceptionnellement avec contrepartie.',
      },
      {
        titre: 'Travail de nuit',
        corps: 'Le travail entre 21h et 6h est considéré comme travail de nuit. Il ouvre droit à une contrepartie sous forme de repos compensateur ou de majoration salariale selon l\'accord d\'entreprise.',
      },
      {
        titre: 'Congés payés',
        corps: '2,5 jours ouvrables par mois travaillé, soit 30 jours (5 semaines) par an. La prise de congés est soumise à l\'accord de l\'employeur mais ne peut être refusée sans motif légitime.',
      },
    ],
  },
  {
    categorie: 'Formation & Carte Pro',
    icon: '🪪',
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    articles: [
      {
        titre: 'Carte professionnelle CNAPS',
        corps: 'Obligatoire pour exercer une activité de sécurité privée. Délivrée par le CNAPS pour 5 ans, renouvelable. Sans carte valide, l\'agent ne peut légalement travailler.',
      },
      {
        titre: 'Formation initiale',
        corps: 'Le CQP Agent de Prévention et de Sécurité (APS) ou équivalent est requis. La formation SST (Sauveteur Secouriste du Travail) est fortement recommandée et souvent exigée.',
      },
      {
        titre: 'Formation continue',
        corps: 'L\'employeur est tenu de financer la formation continue via l\'OPCO. Le CPF (Compte Personnel de Formation) peut également financer des formations certifiantes.',
      },
    ],
  },
  {
    categorie: 'Santé & Sécurité',
    icon: '🛡️',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    articles: [
      {
        titre: 'Équipements de protection',
        corps: 'L\'employeur doit fournir gratuitement tous les EPI nécessaires à l\'exercice de la mission (gilet, lampe, radio, tenue...). Le refus de les fournir est une faute de l\'employeur.',
      },
      {
        titre: 'Accident du travail',
        corps: 'Tout accident survenu par le fait ou à l\'occasion du travail est un accident du travail. Il doit être déclaré par l\'employeur sous 48h. L\'agent bénéficie d\'une prise en charge à 100%.',
      },
      {
        titre: 'Droit de retrait',
        corps: 'L\'agent peut se retirer d\'une situation de travail présentant un danger grave et imminent sans subir de sanction. Ce droit est protégé par le Code du travail (art. L4131-1).',
      },
    ],
  },
];

export default function DroitsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('entreprise_id');
    if (!id) router.push('/agent');
  }, [router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = DROITS.map((cat) => ({
    ...cat,
    articles: cat.articles.filter(
      (a) =>
        !search ||
        a.titre.toLowerCase().includes(search.toLowerCase()) ||
        a.corps.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.articles.length > 0);

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white flex flex-col pb-10">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <button onClick={() => router.push('/agent/hub')} className="text-gray-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-amber-400 transition-colors">
          ← Hub
        </button>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Convention Collective Nationale</p>
        <h1 className="text-amber-400 text-3xl font-black tracking-tighter">MES DROITS</h1>
        <p className="text-gray-500 text-xs mt-1">Sécurité Privée — CCN 2002</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher un droit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400 transition-colors placeholder:text-gray-600"
        />
      </div>

      {/* Accordion */}
      <div className="px-4 space-y-3 flex-1">
        {filtered.map((cat) => (
          <div key={cat.categorie} className={`rounded-2xl border ${cat.border} bg-white/5 overflow-hidden`}>
            <button
              onClick={() => setOpen(open === cat.categorie ? null : cat.categorie)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <span className={`font-black text-sm uppercase tracking-wider ${cat.color}`}>{cat.categorie}</span>
              </div>
              <span className={`text-lg transition-transform duration-200 ${open === cat.categorie ? 'rotate-180' : ''} ${cat.color}`}>
                ›
              </span>
            </button>

            {open === cat.categorie && (
              <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                {cat.articles.map((a) => (
                  <div key={a.titre}>
                    <p className="text-white font-bold text-sm mb-1">{a.titre}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{a.corps}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 text-sm">Aucun résultat pour « {search} »</p>
          </div>
        )}
      </div>

      <p className="text-gray-700 text-[10px] text-center pt-6 uppercase tracking-widest font-bold px-4">
        Informations basées sur la CCN Sécurité — à titre indicatif
      </p>
    </div>
  );
}
