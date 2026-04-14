import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales — SecuPRO",
  description: "Mentions légales de la plateforme SecuPRO.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderLeft: "2px solid rgba(0,209,255,0.35)",
        paddingLeft: "20px",
        marginBottom: "32px",
      }}
    >
      <h2
        style={{
          fontSize: "11px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          color: "#00d1ff",
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg, #020c1b 0%, #04182e 30%, #061f3d 60%, #020e21 100%)",
        color: "#f8fafc",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* En-tête */}
        <div style={{ marginBottom: "48px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(0,209,255,0.55)",
              fontSize: "11px",
              fontWeight: 700,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "32px",
            }}
          >
            ← Retour
          </Link>

          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "rgba(0,209,255,0.5)",
              marginBottom: "12px",
            }}
          >
            Documents légaux
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Mentions{" "}
            <span style={{ color: "#00d1ff" }}>Légales</span>
          </h1>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: "linear-gradient(90deg, #00d1ff, transparent)",
              marginTop: "16px",
            }}
          />
        </div>

        {/* Contenu */}
        <Section title="Éditeur du site">
          <p><strong style={{ color: "#f1f5f9" }}>Dénomination :</strong> SecuPRO</p>
          <p><strong style={{ color: "#f1f5f9" }}>Responsable de publication :</strong> Mustapha JELIKHI</p>
          <p><strong style={{ color: "#f1f5f9" }}>SIRET :</strong> 103 353 926 000 19</p>
          <p>
            <strong style={{ color: "#f1f5f9" }}>Adresse :</strong>{" "}
            19 rue lieutenant-colonel Girard, Lyon 69007, France
          </p>
          <p>
            <strong style={{ color: "#f1f5f9" }}>Contact :</strong>{" "}
            <a
              href="mailto:mustaphajelikhi@outlook.fr"
              style={{ color: "#00d1ff", textDecoration: "none" }}
            >
              mustaphajelikhi@outlook.fr
            </a>
          </p>
        </Section>

        <Section title="Hébergement">
          <p><strong style={{ color: "#f1f5f9" }}>Hébergeur :</strong> Vercel Inc.</p>
          <p><strong style={{ color: "#f1f5f9" }}>Adresse :</strong> 340 Pine Street, Suite 1501, San Francisco, CA 94104, États-Unis</p>
          <p><strong style={{ color: "#f1f5f9" }}>Site :</strong>{" "}
            <span style={{ color: "#00d1ff" }}>vercel.com</span>
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L'ensemble des contenus présents sur la plateforme SecuPRO (textes, logos, icônes, design) est la propriété exclusive de SecuPRO et est protégé par les lois en vigueur sur la propriété intellectuelle.
            Toute reproduction, même partielle, est interdite sans autorisation préalable écrite.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            Les données collectées lors de l'inscription (nom, prénom, adresse e-mail) sont utilisées uniquement pour la gestion des comptes utilisateurs et la fourniture du service.
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant :{" "}
            <a
              href="mailto:mustaphajelikhi@outlook.fr"
              style={{ color: "#00d1ff", textDecoration: "none" }}
            >
              mustaphajelikhi@outlook.fr
            </a>
          </p>
        </Section>

        <Section title="Responsabilité">
          <p>
            SecuPRO s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur la plateforme.
            SecuPRO ne saurait être tenu responsable des interruptions de service dues à des opérations de maintenance ou à des incidents techniques indépendants de sa volonté.
          </p>
        </Section>

        {/* Footer de la page */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(0,209,255,0.1)",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          <Link href="/cgv" style={{ color: "rgba(0,209,255,0.55)", fontSize: "11px", fontWeight: 600, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            CGV →
          </Link>
        </div>
      </div>
    </div>
  );
}
