import SecuProTechLogo from "@/components/SecuProTechLogo";

export default function LogoTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#060D18",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 64,
        padding: "48px 24px",
      }}
    >
      {/* Grande */}
      <SecuProTechLogo width={480} />

      {/* Moyenne */}
      <SecuProTechLogo width={320} />

      {/* Petite */}
      <SecuProTechLogo width={200} />
    </main>
  );
}
