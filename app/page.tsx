'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const chartGrowthRef = useRef<HTMLCanvasElement>(null);
  const chartInfraRef = useRef<HTMLCanvasElement>(null);
  const chartsInitialized = useRef(false);

  useEffect(() => {
    if (chartsInitialized.current) return;

    import('chart.js/auto').then((ChartModule) => {
      const Chart = ChartModule.default;
      if (!chartGrowthRef.current || !chartInfraRef.current) return;
      chartsInitialized.current = true;

      Chart.defaults.color = 'rgba(255,255,255,0.4)';
      Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
      Chart.defaults.font = { family: "'DM Sans', sans-serif", size: 11 } as any;

      new Chart(chartGrowthRef.current, {
        type: 'line',
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [{
            label: 'Cartes pro délivrées (milliers)',
            data: [41, 38, 45, 50, 58, 72, 70.6],
            borderColor: '#0af',
            backgroundColor: 'rgba(0,170,255,0.08)',
            fill: true, tension: 0.4,
            pointBackgroundColor: '#0af',
            pointRadius: 4, borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(6,12,24,0.95)',
              borderColor: 'rgba(0,170,255,0.3)',
              borderWidth: 1,
              callbacks: { label: (ctx: any) => ctx.parsed.y + 'K cartes délivrées' },
            },
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.35)' } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.35)' }, min: 30 },
          },
        },
      });

      new Chart(chartInfraRef.current, {
        type: 'bar',
        data: {
          labels: ['Cartes pro\ndélivrées', 'Autorisations\npréalables', 'Agréments\ndirigeans', 'Contrôles\nterrain', 'Sanctions\ndiscipline'],
          datasets: [{
            data: [70621, 43653, 4061, 1820, 289],
            backgroundColor: ['rgba(0,170,255,0.8)', 'rgba(0,232,160,0.8)', 'rgba(255,171,64,0.8)', 'rgba(255,82,82,0.8)', 'rgba(185,138,255,0.8)'],
            borderRadius: 6, borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(6,12,24,0.95)',
              borderColor: 'rgba(0,170,255,0.3)',
              borderWidth: 1,
              callbacks: { label: (ctx: any) => ctx.parsed.y.toLocaleString('fr-FR') + ' décisions' },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.35)', maxRotation: 0, font: { size: 9 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.35)', callback: (v: any) => v >= 1000 ? Math.round(v / 1000) + 'K' : v } },
          },
        },
      });
    });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .sp-root { background: #060c18; color: #fff; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .sp-section { max-width: 900px; margin: 0 auto; padding: 3rem 2rem; }
        .sp-logo-txt { font-family: 'Rajdhani', sans-serif; font-size: 2.2rem; font-weight: 700; letter-spacing: 2px; }
        .sp-logo-txt .w { color: #fff; }
        .sp-logo-txt .b { color: #00aaff; }
        .sp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,170,255,0.1); border: 1px solid rgba(0,170,255,0.3); border-radius: 20px; padding: 3px 10px; font-size: 0.68rem; letter-spacing: 1px; color: #0af; text-transform: uppercase; font-weight: 600; }
        .sp-pulse { width: 6px; height: 6px; background: #0af; border-radius: 50%; animation: sp-pulse 1.8s ease-in-out infinite; flex-shrink: 0; }
        @keyframes sp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .sp-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(0,170,255,0.2), transparent); }
        .sp-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(0,170,255,0.15); border-radius: 14px; padding: 1.5rem; text-align: center; position: relative; overflow: hidden; }
        .sp-stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .sp-stat-card.blue::before { background: linear-gradient(to right, transparent, #0af, transparent); }
        .sp-stat-card.green::before { background: linear-gradient(to right, transparent, #00e8a0, transparent); }
        .sp-stat-card.orange::before { background: linear-gradient(to right, transparent, #ffab40, transparent); }
        .sp-stat-card.red::before { background: linear-gradient(to right, transparent, #ff6b6b, transparent); }
        .sp-stat-card.purple::before { background: linear-gradient(to right, transparent, #b98aff, transparent); }
        .sp-chart-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(0,170,255,0.1); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; height: 260px; position: relative; max-width: 800px; margin-left: auto; margin-right: auto; }
        .sp-feat-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 1.2rem; }
        .sp-comp-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
        .sp-comp-label { font-size: 0.78rem; color: rgba(255,255,255,0.55); width: 200px; flex-shrink: 0; }
        .sp-access-card { border-radius: 18px; padding: 2rem 1.5rem; text-align: center; transition: transform 0.2s, border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .sp-access-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .sp-access-card.agent { background: rgba(0,232,160,0.04); border: 1px solid rgba(0,232,160,0.2); }
        .sp-access-card.agent::before { background: linear-gradient(to right, transparent, #00e8a0, transparent); }
        .sp-access-card.societe { background: rgba(0,170,255,0.04); border: 1px solid rgba(0,170,255,0.2); }
        .sp-access-card.societe::before { background: linear-gradient(to right, transparent, #0af, transparent); }
        .sp-access-card:hover { transform: translateY(-6px); }
        .sp-access-card.agent:hover { border-color: rgba(0,232,160,0.5); background: rgba(0,232,160,0.08); }
        .sp-access-card.societe:hover { border-color: rgba(0,170,255,0.5); background: rgba(0,170,255,0.08); }
        @media (max-width: 768px) {
          .sp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sp-chart-wrap { height: 220px; }
          .sp-section { padding: 2rem 1.5rem; }
        }
        @media (max-width: 480px) {
          .sp-stats-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .sp-chart-wrap { height: 200px; }
          .sp-section { padding: 1.5rem 1rem; }
          .sp-hero-inner { padding: 1rem !important; }
          .sp-comp-label { width: 120px; }
          .sp-trial { flex-direction: column !important; align-items: flex-start !important; }
          .sp-access-card { min-width: 100% !important; max-width: 100% !important; flex: unset !important; width: 100%; }
        }
      `}</style>

      <div className="sp-root">

        {/* LOGO */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem 1rem' }}>
          <div className="sp-logo-txt"><span className="w">Secu</span><span className="b">PRO</span></div>
        </div>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '3rem 2rem 2rem' }}>
          <div className="sp-hero-inner" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
              Plateforme SaaS · Sécurité Privée Française
            </div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
              La gestion de vos agents,<br /><span style={{ color: '#0af' }}>enfin conforme.</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              SecuPRO centralise plannings, conformité CNAPS, documents et paie — pour les exploitants qui n'ont plus le droit à l'erreur.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', padding: '0.5rem 0 1.5rem' }}>
              {['CNAPS', 'IDCC 1351', 'Code du Travail', 'AN2V', 'SSIAP'].map(b => (
                <span key={b} className="sp-badge"><span className="sp-pulse" />{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="sp-divider" />

        {/* STATS */}
        <div className="sp-section">
          <div style={{ textAlign: 'center', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
            Le secteur en chiffres — Rapport officiel CNAPS 2025
          </div>
          <div className="sp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { num: '300 000+', label: 'Personnes habilitées en France', source: 'CNAPS — Rapport annuel 2025', color: 'blue' },
              { num: '12 000+', label: 'Entreprises de sécurité privée', source: 'CNAPS — Rapport annuel 2025', color: 'green' },
              { num: '70 621', label: 'Cartes pro délivrées en 2025', source: 'CNAPS — Chiffres clés 2025 (+21% vs 2023)', color: 'orange' },
              { num: '1 820', label: 'Contrôles menés sur le terrain', source: 'CNAPS — Bilan disciplinaire 2025', color: 'red' },
              { num: '5,3 M€', label: 'Pénalités financières — record', source: 'CNAPS — Rapport annuel 2025', color: 'purple' },
              { num: '+21%', label: 'Cartes pro délivrées vs 2023', source: 'CNAPS — Activité délivrance 2025', color: 'blue' },
            ].map((s, i) => (
              <div key={i} className={`sp-stat-card ${s.color}`}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: s.color === 'green' ? '#00e8a0' : s.color === 'orange' ? '#ffab40' : s.color === 'red' ? '#ff6b6b' : s.color === 'purple' ? '#b98aff' : '#0af', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1.4 }}>{s.label}</div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(0,170,255,0.45)', marginTop: '7px', borderTop: '1px solid rgba(0,170,255,0.08)', paddingTop: '6px', lineHeight: 1.4 }}>{s.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sp-divider" />

        {/* CHARTS */}
        <div className="sp-section" style={{ paddingBottom: '1rem' }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.3rem' }}>Croissance des cartes professionnelles</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Cartes professionnelles délivrées par le CNAPS (milliers) — Source CNAPS</div>
          <div className="sp-chart-wrap">
            <div style={{ fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>Délivrance de cartes pro 2019 – 2025</div>
            <canvas ref={chartGrowthRef} height={260} style={{ maxHeight: '260px' }} />
          </div>
        </div>

        <div className="sp-section" style={{ paddingTop: '0' }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.3rem' }}>Activité disciplinaire CNAPS 2025</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Répartition des décisions prononcées — Source CNAPS Rapport Annuel 2025</div>
          <div className="sp-chart-wrap">
            <div style={{ fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>Décisions & sanctions 2025</div>
            <canvas ref={chartInfraRef} height={260} style={{ maxHeight: '260px' }} />
          </div>
        </div>

        <div className="sp-divider" />

        {/* RISQUES */}
        <div className="sp-section">
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.3rem' }}>Risques opérationnels non couverts</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Manquements relevés lors des contrôles — Source CNAPS 2025</div>
          {[
            { label: 'Exercice sans autorisation', pct: 65, color: '#ff5252' },
            { label: 'Sous-traitance illégale', pct: 52, color: '#ff5252' },
            { label: 'Travail dissimulé', pct: 44, color: '#ffab40' },
            { label: 'Carte pro expirée / absente', pct: 38, color: '#ffab40' },
            { label: 'Défaut de formation obligatoire', pct: 28, color: '#0af' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="sp-comp-label">{r.label}</span>
              <div className="sp-comp-bar-bg"><div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: '3px' }} /></div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', width: '32px', textAlign: 'right' }}>{r.pct}%</span>
            </div>
          ))}
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', paddingTop: '0.5rem' }}>Source : CNAPS — Rapport annuel 2025 · Constats lors des contrôles terrain</div>
        </div>

        <div className="sp-divider" />

        {/* FEATURES */}
        <div className="sp-section">
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.3rem' }}>Ce que SecuPRO résout</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Conçu par un ex-agent. Pensé pour les exploitants.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '📋', title: 'Planning IA', desc: 'Détection automatique des conflits, repos non respectés et dépassements IDCC 1351.' },
              { icon: '🛡️', title: 'Conformité CNAPS', desc: "Alertes cartes pro, SSIAP, SST — avant l'expiration, pas après le contrôle." },
              { icon: '📑', title: 'Analyse de paie IA', desc: 'Détection des déductions injustifiées et anomalies salariales sur les bulletins.' },
              { icon: '⚡', title: 'Import CSV 5 étapes', desc: '50 agents provisionnés en moins de 10 minutes depuis Comète ou Excel.' },
            ].map((f, i) => (
              <div key={i} className="sp-feat-card">
                <div style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>{f.icon}</div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sp-divider" />

        {/* TRIAL */}
        <div className="sp-section">
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.3rem' }}>Comment ça fonctionne</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Démarrage sans risque, abonnement automatique après l'essai</div>
          <div className="sp-trial" style={{ background: 'linear-gradient(135deg,rgba(0,170,255,0.12),rgba(0,232,160,0.08))', border: '1px solid rgba(0,170,255,0.25)', borderRadius: '14px', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>🗓️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.3rem', fontWeight: 700 }}>30 jours d'essai gratuit — puis abonnement automatique</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginTop: '2px' }}>Aucune interruption de service. Résiliable à tout moment depuis votre espace client.</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', width: '100%' }}>
              {["Inscription en 2 minutes", "30 jours d'accès complet gratuit", "Abonnement activé automatiquement", "Résiliation en 1 clic si besoin"].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,170,255,0.2)', border: '1px solid rgba(0,170,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#0af', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOUNDER */}
        <div className="sp-section" style={{ paddingTop: '0' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #0af', borderRadius: '0 10px 10px 0', padding: '1rem 1.2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontStyle: 'italic' }}>
            "J'ai travaillé des années sur le terrain comme agent de sécurité. J'ai vu des collègues perdre des heures de paye, rater des vacations, égarer leurs cartes pro. SecuPRO est la solution que j'aurais voulu avoir."
            <div style={{ fontStyle: 'normal', fontWeight: 600, color: '#0af', fontSize: '0.78rem', marginTop: '6px' }}>— Mustapha, Fondateur SecuPRO · Ex-agent APS · Chef de site</div>
          </div>
        </div>

        <div className="sp-divider" />

        {/* ACCESS CHOICE */}
        <div style={{ padding: '3rem 2rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(0,170,255,0.12)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', fontSize: '0.72rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.6rem' }}>Choisissez votre espace</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.4rem' }}>Quel est votre profil ?</div>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2rem' }}>30 jours gratuits · Abonnement automatique ensuite · Résiliation en 1 clic</div>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/agent" className="sp-access-card agent" style={{ flex: 1, minWidth: '240px', maxWidth: '300px', textDecoration: 'none', display: 'block' }}>
                <span style={{ fontSize: '2.8rem', marginBottom: '1rem', display: 'block' }}>👮</span>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.2rem' }}>Espace Agent</div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#00e8a0', marginBottom: '1rem' }}>Terrain · Hub</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Planning, fiches de paie, documents, alertes CNAPS. Tout ce dont l'agent a besoin, en temps réel.</div>
                <div style={{ display: 'inline-block', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', padding: '0.55rem 1.4rem', borderRadius: '6px', fontWeight: 600, border: '1px solid rgba(0,232,160,0.4)', color: '#00e8a0' }}>Accéder →</div>
              </Link>
              <Link href="/entreprises" className="sp-access-card societe" style={{ flex: 1, minWidth: '240px', maxWidth: '300px', textDecoration: 'none', display: 'block' }}>
                <span style={{ fontSize: '2.8rem', marginBottom: '1rem', display: 'block' }}>🏢</span>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.2rem' }}>Espace Société</div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#0af', marginBottom: '1rem' }}>Gestion · Exploitation</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Gestion des équipes, provisioning, conformité IDCC 1351. La plateforme des chefs d'exploitation.</div>
                <div style={{ display: 'inline-block', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', padding: '0.55rem 1.4rem', borderRadius: '6px', fontWeight: 600, border: '1px solid rgba(0,170,255,0.4)', color: '#0af' }}>Accéder →</div>
              </Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '1px' }}>
              Sans engagement · Paiement sécurisé via Stripe · secupro.app
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
