"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const NAVY   = "#060E18";
const NAVY_2 = "#091527";
const CYAN   = "#00C8F0";
const ORANGE = "#F5822A";

interface FormState {
  nomSociete: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const e: FieldErrors = {};
  if (!form.nomSociete.trim()) e.nomSociete = "Nom de société requis";
  if (!form.email.trim()) {
    e.email = "Email requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = "Adresse email invalide";
  }
  if (form.password.length < 8) e.password = "Minimum 8 caractères";
  if (form.password !== form.confirmPassword)
    e.confirmPassword = "Les mots de passe ne correspondent pas";
  return e;
}

const INPUT_STYLE = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  background: "rgba(0,0,0,0.35)",
  border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(0,200,240,0.15)"}`,
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#f1f5f9",
  fontSize: "14px",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(148,163,184,0.7)",
  marginBottom: "8px",
};

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nomSociete: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGlobalError("");

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            nom_societe: form.nomSociete.trim(),
            role: "societe",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setGlobalError(error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setGlobalError("Impossible de récupérer l'identifiant utilisateur. Veuillez réessayer.");
        return;
      }

      router.push(
        `/inscription/paiement?userId=${userId}&nom=${encodeURIComponent(form.nomSociete.trim())}`
      );
    } catch {
      setGlobalError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: NAVY,
        minHeight: "100vh",
        color: "#f1f5f9",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        input:focus {
          outline: none;
          border-color: ${CYAN} !important;
          box-shadow: 0 0 0 3px rgba(0,200,240,0.1);
        }
      `}</style>

      {/* Logo */}
      <Link href="/entreprises" style={{ textDecoration: "none", marginBottom: "36px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          <span style={{ color: "#fff" }}>Secu</span>
          <span style={{ color: CYAN }}>PRO</span>
          <span style={{ color: ORANGE, fontSize: "1rem", marginLeft: "6px" }}>TECH</span>
        </div>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(0,200,240,0.4)",
            marginTop: "4px",
          }}
        >
          Gestion · Conformité · Terrain
        </div>
      </Link>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: `linear-gradient(145deg, ${NAVY_2} 0%, #0D1F35 100%)`,
          border: "1px solid rgba(0,200,240,0.14)",
          borderRadius: "24px",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Créer votre compte
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(148,163,184,0.65)",
            marginBottom: "28px",
            lineHeight: 1.55,
          }}
        >
          1 mois gratuit · Sans engagement · Résiliation en 1 clic
        </p>

        {globalError && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}
          >
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Nom société */}
          <div>
            <label style={LABEL_STYLE}>Nom de votre société *</label>
            <input
              type="text"
              value={form.nomSociete}
              onChange={(e) => setField("nomSociete", e.target.value)}
              placeholder="Gardiennage Lyon Est SARL"
              disabled={loading}
              autoComplete="organization"
              style={INPUT_STYLE(!!errors.nomSociete)}
            />
            {errors.nomSociete && (
              <p style={{ color: "#fca5a5", fontSize: "11px", marginTop: "5px" }}>
                {errors.nomSociete}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={LABEL_STYLE}>Email professionnel *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="directeur@masociete.fr"
              disabled={loading}
              autoComplete="email"
              style={INPUT_STYLE(!!errors.email)}
            />
            {errors.email && (
              <p style={{ color: "#fca5a5", fontSize: "11px", marginTop: "5px" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label style={LABEL_STYLE}>Mot de passe *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="8 caractères minimum"
              disabled={loading}
              autoComplete="new-password"
              style={INPUT_STYLE(!!errors.password)}
            />
            {errors.password && (
              <p style={{ color: "#fca5a5", fontSize: "11px", marginTop: "5px" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmer */}
          <div>
            <label style={LABEL_STYLE}>Confirmer le mot de passe *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              style={INPUT_STYLE(!!errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p style={{ color: "#fca5a5", fontSize: "11px", marginTop: "5px" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading
                ? "rgba(0,200,240,0.2)"
                : `linear-gradient(135deg, #009BB8 0%, ${CYAN} 100%)`,
              border: "none",
              borderRadius: "12px",
              padding: "15px",
              color: loading ? "rgba(255,255,255,0.4)" : NAVY,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 0 32px rgba(0,200,240,0.3)`,
              transition: "all 0.2s",
              marginTop: "6px",
            }}
          >
            {loading ? "Création du compte..." : "Créer mon compte gratuit →"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "rgba(100,116,139,0.5)",
            marginTop: "20px",
          }}
        >
          Déjà inscrit ?{" "}
          <Link href="/espace-societe" style={{ color: CYAN, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "10px",
            color: "rgba(100,116,139,0.35)",
            marginTop: "10px",
          }}
        >
          Données chiffrées AES-256 · Hébergement France · RGPD conforme
        </p>
      </div>
    </div>
  );
}
