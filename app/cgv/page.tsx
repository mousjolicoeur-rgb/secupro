import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — SecuPRO",
  description: "Conditions générales de vente de l'abonnement SecuPRO Hub Agent.",
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

export default function CGVPage() {
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
            Conditions Générales{" "}
            <span style={{ color: "#00d1ff" }}>de Vente</span>
          </h1>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: "linear-gradient(90deg, #00d1ff, transparent)",
              marginTop: "16px",
            }}
          />
          <p style={{ marginTop: "16px", color: "rgba(148,163,184,0.7)", fontSize: "12px" }}>
            En vigueur au 15 avril 2026
          </p>
        </div>

        {/* Contenu */}
        <Section title="Article 1 — Objet">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre SecuPRO, dont le siège est situé au 19 rue lieutenant-colonel Girard, Lyon 69007, France (SIRET : 103 353 926 000 19), et tout utilisateur souscrivant à un abonnement payant sur la plateforme SecuPRO.
          </p>
        </Section>

        <Section title="Article 2 — Service proposé">
          <p>
            <strong style={{ color: "#f1f5f9" }}>Service :</strong> Abonnement au Hub Agent SecuPRO.
          </p>
          <p style={{ marginTop: "8px" }}>
            L'abonnement donne accès aux modules premium de la plateforme SecuPRO, incluant notamment :
          </p>
          <ul style={{ marginTop: "8px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <li>Planning de Mission</li>
            <li>Bulletins de Paie</li>
            <li>Secu AI Intelligence</li>
            <li>Veille Tactique</li>
            <li>Actualités secteur sécurité privée</li>
          </ul>
        </Section>

        <Section title="Article 3 — Tarif">
          <p>
            <strong style={{ color: "#f1f5f9" }}>Prix :</strong>{" "}
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "16px" }}>9,99 € TTC / mois</span>
          </p>
          <p style={{ marginTop: "8px" }}>
            L'abonnement est proposé <strong style={{ color: "#f1f5f9" }}>sans engagement de durée</strong>.
            Le paiement est prélevé mensuellement par carte bancaire via la plateforme sécurisée Stripe.
          </p>
          <p style={{ marginTop: "8px" }}>
            Les prix sont indiqués toutes taxes comprises (TTC). SecuPRO se réserve le droit de modifier ses tarifs sous réserve d'un préavis de 30 jours.
          </p>
        </Section>

        <Section title="Article 4 — Durée et résiliation">
          <p>
            L'abonnement est souscrit pour une durée mensuelle, renouvelée automatiquement à chaque échéance.
          </p>
          <p style={{ marginTop: "8px" }}>
            <strong style={{ color: "#f1f5f9" }}>Résiliation :</strong> Possible à tout moment depuis votre espace client, sans frais ni justification.
            La résiliation prend effet à la fin de la période mensuelle en cours déjà réglée.
          </p>
          <p style={{ marginTop: "8px" }}>
            Aucun remboursement prorata temporis n'est accordé pour une période entamée.
          </p>
        </Section>

        <Section title="Article 5 — Droit de rétractation">
          <p>
            Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement après l'achat, avec accord préalable de l'utilisateur.
          </p>
          <p style={{ marginTop: "8px" }}>
            En souscrivant à l'abonnement, l'utilisateur reconnaît expressément renoncer à son droit de rétractation dès lors que l'accès aux modules premium est accordé immédiatement.
          </p>
        </Section>

        <Section title="Article 6 — Paiement sécurisé">
          <p>
            Les paiements sont traités par <strong style={{ color: "#f1f5f9" }}>Stripe Inc.</strong>, prestataire de service de paiement certifié PCI-DSS.
            SecuPRO ne stocke aucune donnée bancaire sur ses serveurs.
          </p>
        </Section>

        <Section title="Article 7 — Contact">
          <p>
            Pour toute question relative à votre abonnement ou à ces CGV, contactez-nous :{" "}
            <a
              href="mailto:support@secupro.app"
              style={{ color: "#00d1ff", textDecoration: "none" }}
            >
              support@secupro.app
            </a>
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
          <Link href="/mentions-legales" style={{ color: "rgba(0,209,255,0.55)", fontSize: "11px", fontWeight: 600, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            ← Mentions légales
          </Link>
        </div>
      </div>
    </div>
  );
}
