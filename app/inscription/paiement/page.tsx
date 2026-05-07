"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CYAN  = "#00d1ff";
const NAVY  = "#0B1426";
const RED   = "#f87171";
const MUTED = "rgba(148,163,184,0.55)";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const cardStyle = {
  style: {
    base: {
      color: "#f1f5f9",
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "rgba(148,163,184,0.45)" },
    },
    invalid: { color: "#f87171", iconColor: "#f87171" },
  },
};

function PaiementForm({
  clientSecret,
  subscriptionId,
  societeId,
  onSuccess,
}: {
  clientSecret: string;
  subscriptionId: string;
  societeId: string;
  onSuccess: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Carte introuvable.");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: confirmErr, setupIntent } = await stripe.confirmCardSetup(
      clientSecret,
      { payment_method: { card } }
    );

    if (confirmErr) {
      setError(confirmErr.message ?? "La carte n’a pas pu être validée.");
      setBusy(false);
      return;
    }

    const pm = setupIntent?.payment_method;
    const pmId = typeof pm === "string" ? pm : pm?.id;

    if (!pmId) {
      setError("Erreur après validation — contactez le support.");
      setBusy(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Session expirée. Reconnectez-vous.");
      setBusy(false);
      return;
    }

    const attachRes = await fetch("/api/stripe/subscription-attach-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        societe_id: societeId,
        subscription_id: subscriptionId,
        payment_method_id: pmId,
      }),
    });

    if (!attachRes.ok) {
      const attachJson = await attachRes.json() as { error?: string };
      setError(attachJson.error ?? "Erreur lors de l’activation de l’essai.");
      setBusy(false);
      return;
    }

    sessionStorage.removeItem("inscription_checkout");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div
        className="rounded-xl px-4 py-4"
        style={{
          background: "rgba(0,209,255,0.04)",
          border: "1px solid rgba(0,209,255,0.18)",
        }}
      >
        <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] mb-3"
          style={{ color: "rgba(0,209,255,0.55)" }}>
          <Lock size={11} style={{ color: CYAN }} />
          Carte bancaire
        </label>
        <CardElement options={cardStyle} />
      </div>

      <p className="text-[11px] text-center leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>
        <span style={{ color: "rgba(52,211,153,0.85)" }}>Aucun débit aujourd’hui</span>
        {" · "}
        Résiliable à tout moment depuis l’espace client Stripe.
      </p>

      {error && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)" }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: RED }} />
          <span className="text-[11px] font-medium" style={{ color: RED }}>{error}</span>
        </div>
      )}

      <motion.button
        type="submit"
        disabled={!stripe || busy}
        whileHover={{ scale: stripe && !busy ? 1.02 : 1 }}
        whileTap={{ scale: stripe && !busy ? 0.98 : 1 }}
        className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.18em]"
        style={{
          background: stripe && !busy ? `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)` : "rgba(0,209,255,0.2)",
          color: stripe && !busy ? NAVY : "rgba(0,209,255,0.45)",
          cursor: stripe && !busy ? "pointer" : "not-allowed",
          border: "none",
          boxShadow: stripe && !busy ? "0 0 28px rgba(0,209,255,0.25)" : "none",
        }}
      >
        {busy ? "Validation…" : "Démarrer mon essai gratuit →"}
        {!busy && <ArrowRight size={14} />}
      </motion.button>
    </form>
  );
}

export default function InscriptionPaiementPage() {
  const router = useRouter();
  const [clientSecret, setClientSecret]     = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [societeId, setSocieteId]           = useState<string | null>(null);
  const [loading, setLoading]               = useState(true);
  const [initErr, setInitErr]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const raw = sessionStorage.getItem("inscription_checkout");
      if (!raw) {
        router.replace("/inscription");
        return;
      }

      let parsed: { societe_id: string; email: string };
      try {
        parsed = JSON.parse(raw) as { societe_id: string; email: string };
      } catch {
        router.replace("/inscription");
        return;
      }

      if (!cancelled) setSocieteId(parsed.societe_id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if (!cancelled) {
          setInitErr("Session expirée. Reconnectez-vous puis réessayez depuis l’inscription.");
          setLoading(false);
        }
        return;
      }

      const res = await fetch("/api/stripe/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ societe_id: parsed.societe_id }),
      });

      const data = await res.json() as {
        client_secret?: string;
        subscription_id?: string;
        already_complete?: boolean;
        error?: string;
      };

      if (cancelled) return;

      if (!res.ok) {
        setInitErr(data.error ?? "Impossible de préparer le paiement.");
        setLoading(false);
        return;
      }

      if (data.already_complete) {
        sessionStorage.removeItem("inscription_checkout");
        router.replace("/espace-societe/dashboard?trial_started=1");
        return;
      }

      if (!data.client_secret || !data.subscription_id) {
        setInitErr("Réponse Stripe incomplète.");
        setLoading(false);
        return;
      }

      setClientSecret(data.client_secret);
      setSubscriptionId(data.subscription_id);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSuccess = () => {
    router.replace("/espace-societe/dashboard?trial_started=1");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: `radial-gradient(ellipse 110% 65% at 50% 0%, rgba(0,40,100,0.45) 0%, ${NAVY} 55%)`,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,209,255,0.02) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,209,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.75rem", letterSpacing: "3px" }}>
            <span style={{ color: "#fff" }}>Secu</span>
            <span style={{ color: "#00aaff" }}>PRO</span>
          </span>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-1" style={{ color: "rgba(0,209,255,0.4)" }}>
            Finaliser l’essai
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(10,20,44,0.9)",
            border: "1px solid rgba(0,209,255,0.12)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          }}
        >
          <h1 className="text-[17px] font-black text-center mb-2">
            Essai gratuit 7 jours
          </h1>
          <p className="text-[13px] text-center mb-1" style={{ color: MUTED }}>
            Puis <strong style={{ color: "#f1f5f9" }}>69,99 €</strong> / mois (plan Essentiel)
          </p>
          <p className="text-[10px] text-center mb-6" style={{ color: "rgba(148,163,184,0.35)" }}>
            Carte enregistrée pour renouvellement automatique après l’essai — aucun débit pendant 7 jours.
          </p>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-8 h-8 rounded-full animate-spin"
                style={{ border: "2px solid rgba(0,209,255,0.2)", borderTopColor: CYAN }} />
              <span className="text-[11px] font-medium" style={{ color: MUTED }}>Connexion sécurisée à Stripe…</span>
            </div>
          )}

          {!loading && initErr && (
            <div className="text-center">
              <p className="text-[13px] mb-4" style={{ color: RED }}>{initErr}</p>
              <button type="button" onClick={() => router.push("/inscription")}
                className="text-[11px] font-bold underline" style={{ color: CYAN, background: "none", border: "none", cursor: "pointer" }}>
                Retour à l’inscription
              </button>
            </div>
          )}

          {!loading && !initErr && clientSecret && subscriptionId && societeId && (
            <Elements stripe={stripePromise}>
              <PaiementForm
                clientSecret={clientSecret}
                subscriptionId={subscriptionId}
                societeId={societeId}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </div>
      </motion.div>
    </div>
  );
}
