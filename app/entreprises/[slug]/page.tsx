import Link from "next/link";

const NAVY  = "#060E18";
const CYAN  = "#00C8F0";

const MODULE_LABELS: Record<string, string> = {
  csv:    "Effectifs CSV",
  ia:     "Plannings IA",
  live:   "Dashboard Live",
  pdf:    "Rapports PDF",
  cnaps:  "Conformité CNAPS",
  alerts: "Alertes Push",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EntrepriseModulePage({ params }: Props) {
  const { slug } = await params;
  const label = MODULE_LABELS[slug] ?? slug;

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
        gap: "32px",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: `rgba(0,200,240,0.5)`,
        }}
      >
        Module · /entreprises/{slug}
      </p>

      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "clamp(2rem, 6vw, 4rem)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#ffffff",
          margin: 0,
        }}
      >
        {label}
      </h1>

      <p style={{ fontSize: "15px", color: "rgba(148,163,184,0.7)", maxWidth: "400px", lineHeight: 1.7 }}>
        Page de détail du module <strong style={{ color: CYAN }}>{label}</strong>.
        Contenu à venir.
      </p>

      <Link
        href="/entreprises"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(0,200,240,0.08)",
          border: "1px solid rgba(0,200,240,0.25)",
          color: CYAN,
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "12px 28px",
          borderRadius: "10px",
          textDecoration: "none",
        }}
      >
        ← Retour aux modules
      </Link>
    </div>
  );
}
