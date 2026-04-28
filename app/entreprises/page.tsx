"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: "Starter",
    price: "49,99 €",
    priceId: "price_1TQ6aARrtg7xDsW3aILcB4JD",
    description: "Pour les petites structures",
    color: "border-blue-500",
    badge: null,
    features: [
      "Jusqu'à 10 agents",
      "Import planning CSV",
      "Tableau de bord performance",
      "Support email",
    ],
  },
  {
    name: "Business",
    price: "99,99 €",
    priceId: "price_1TQ6aCRrtg7xDsW3YZ5Proch",
    description: "Pour les entreprises en croissance",
    color: "border-purple-500",
    badge: "Populaire",
    features: [
      "Jusqu'à 50 agents",
      "Tout Starter inclus",
      "Détection conflits planning",
      "Analyse bulletins de salaire",
      "Notifications push",
      "Support prioritaire",
    ],
  },
  {
    name: "Enterprise",
    price: "199,99 €",
    priceId: "price_1TQ6aARrtg7xDsW30awo9TNH",
    description: "Pour les grandes sociétés de sécurité",
    color: "border-yellow-500",
    badge: "Premium",
    features: [
      "Agents illimités",
      "Tout Business inclus",
      "SecuIA — assistant juridique IA",
      "Multi-sites & multi-sociétés",
      "Tableau de bord admin avancé",
      "Account manager dédié",
    ],
  },
];

export default function AbonnementPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(null);
        return;
      }

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black tracking-tight mb-3">
          Choisissez votre plan <span className="text-blue-500">SecuPRO</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Conçu par un agent. Pour les agents.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.priceId}
            className={`relative bg-gray-900 rounded-2xl border-2 ${plan.color} p-8 flex flex-col`}
          >
            {/* Badge */}
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                {plan.badge}
              </span>
            )}

            {/* Plan name */}
            <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

            {/* Price */}
            <div className="mb-8">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-gray-400 text-sm ml-1">/ mois</span>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading === plan.priceId}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                loading === plan.priceId
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {loading === plan.priceId ? "Chargement..." : "Commencer l'essai gratuit"}
            </button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-gray-600 text-xs mt-12">
        7 jours d'essai gratuit — Sans engagement — Résiliable à tout moment
      </p>
    </div>
  );
}
