'use client';

import React, { useState } from 'react';
import { Check, ShieldAlert, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 49.99,
    description: 'Pour les petites sociétés de sécurité',
    features: ["Gestion jusqu'à 25 agents", 'Import CSV', 'Support par email', 'Base de données sécurisée'],
    icon: ShieldAlert,
    priceId: 'price_essentiel_mock', // Remplacer par le vrai ID Stripe
    color: 'blue'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99.99,
    description: 'Pour les entreprises en croissance',
    features: ["Gestion jusqu'à 100 agents", 'Dashboard de performances complet', 'Assistant SecuIA', 'Support prioritaire'],
    icon: Zap,
    priceId: 'price_pro_mock', // Remplacer par le vrai ID Stripe
    color: 'emerald',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199.99,
    description: 'Pour les leaders de la sécurité',
    features: ['Agents illimités', 'API publique', 'Account manager dédié', 'Toutes les features Pro'],
    icon: Star,
    priceId: 'price_premium_mock', // Remplacer par le vrai ID Stripe
    color: 'purple'
  }
];

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (priceId: string) => {
    setLoadingId(priceId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          // En vrai, il faudrait l'ID de la société récupéré depuis le contexte auth
          societeId: '11111111-1111-1111-1111-111111111111' 
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Des tarifs transparents pour la sécurité</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Choisissez le plan adapté à votre société. Tous les plans incluent un essai gratuit de 7 jours.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div 
                key={plan.id}
                className={`relative rounded-3xl p-8 bg-slate-800 border-2 ${
                  plan.popular ? 'border-blue-500 shadow-xl shadow-blue-900/20' : 'border-slate-700 shadow-lg'
                } flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    Le plus populaire
                  </div>
                )}
                
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-slate-400 mt-1">{plan.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${plan.color}-500/20 text-${plan.color}-400`}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">{plan.price}€</span>
                  <span className="text-slate-400">/mois</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 bg-emerald-500/20 rounded-full p-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loadingId === plan.priceId}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {loadingId === plan.priceId ? 'Chargement...' : "Commencer l'essai gratuit"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
