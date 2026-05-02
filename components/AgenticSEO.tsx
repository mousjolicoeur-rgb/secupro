import React from 'react';

export default function AgenticSEO() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "SecuPRO",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "Plateforme SaaS d'audit et de conformité réglementaire pour les sociétés de sécurité privée (Livre VI CSI, CNAPS, URSSAF).",
        "offers": {
          "@type": "Offer",
          "price": "99.00",
          "priceCurrency": "EUR"
        },
        "potentialAction": {
          "@type": "Action",
          "name": "Générer un Audit de Conformité",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.secupro.fr/audit?siret={siret}",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          }
        }
      },
      {
        "@type": "WebSite",
        "name": "SecuPRO",
        "url": "https://www.secupro.fr",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.secupro.fr/verification?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}