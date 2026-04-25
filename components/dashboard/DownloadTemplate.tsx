'use client';
import React, { useState } from 'react';
import { Download, Eye, BarChart3, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface TemplateData {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  statut: 'actif' | 'inactif' | 'en_congé';
  date_embauche: string;
  specialite: string;
  salaire_brut: string;
}

const EXAMPLE_AGENTS: TemplateData[] = [
  {
    email: 'pierre.dupont@secupro.fr',
    nom: 'Dupont',
    prenom: 'Pierre',
    telephone: '06 01 02 03 04',
    adresse: '123 Rue de Paris, 75001 Paris',
    statut: 'actif',
    date_embauche: '2024-01-15',
    specialite: 'Sécurité Événementielle',
    salaire_brut: '2500.00',
  },
  {
    email: 'marie.leclerc@secupro.fr',
    nom: 'Leclerc',
    prenom: 'Marie',
    telephone: '06 05 06 07 08',
    adresse: '456 Avenue Lyon, 69000 Lyon',
    statut: 'actif',
    date_embauche: '2023-06-20',
    specialite: 'Gardiennage Immobilier',
    salaire_brut: '2300.00',
  },
  {
    email: 'jean.martin@secupro.fr',
    nom: 'Martin',
    prenom: 'Jean',
    telephone: '06 09 10 11 12',
    adresse: '789 Boulevard Marseille, 13000 Marseille',
    statut: 'actif',
    date_embauche: '2024-03-01',
    specialite: 'Surveillance Commerciale',
    salaire_brut: '2200.00',
  },
  {
    email: 'sophie.bernard@secupro.fr',
    nom: 'Bernard',
    prenom: 'Sophie',
    telephone: '06 13 14 15 16',
    adresse: '321 Rue Toulouse, 31000 Toulouse',
    statut: 'en_congé',
    date_embauche: '2023-09-10',
    specialite: 'Maître-Chien',
    salaire_brut: '2600.00',
  },
];

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  email:         "Adresse email unique de l'agent",
  nom:           'Nom de famille (obligatoire)',
  prenom:        'Prénom (obligatoire)',
  telephone:     'Numéro de téléphone au format français (06/07)',
  adresse:       'Adresse complète du domicile',
  statut:        'Statut professionnel (actif / inactif / en_congé)',
  date_embauche: 'Date au format YYYY-MM-DD',
  specialite:    'Domaine de spécialisation de sécurité',
  salaire_brut:  'Montant mensuel brut en euros (décimal avec point)',
};

export default function DownloadTemplate() {
  const [showPreview, setShowPreview] = useState(false);
  const [showAuditGraph, setShowAuditGraph] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'table' | 'json' | 'csv'>('table');

  const downloadCSV = () => {
    const csv = Papa.unparse(EXAMPLE_AGENTS);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `template_agents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadJSON = () => {
    const data = {
      metadata: { generated: new Date().toISOString(), version: '1.0', organization: 'SecuPRO' },
      schema: COLUMN_DESCRIPTIONS,
      examples: EXAMPLE_AGENTS,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `template_agents_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Template d'Import Agents</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Téléchargez un fichier modèle pour importer vos agents en masse dans SecuPRO
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={downloadCSV} className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md">
              <Download className="w-5 h-5" /> Télécharger CSV
            </button>
            <button onClick={downloadJSON} className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md">
              <Download className="w-5 h-5" /> Télécharger JSON
            </button>
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors">
              <Eye className="w-5 h-5" /> Aperçu
            </button>
            <button onClick={() => setShowAuditGraph(!showAuditGraph)} className="inline-flex items-center gap-2 px-5 py-3 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-lg font-semibold transition-colors">
              <BarChart3 className="w-5 h-5" /> Graphify Audit
            </button>
          </div>
        </div>
      </div>

      {/* Column Reference */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Format des colonnes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(COLUMN_DESCRIPTIONS).map(([column, description]) => (
            <div key={column} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-blue-500">
              <code className="text-sm font-bold text-blue-600 dark:text-blue-400 block mb-1">{column}</code>
              <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aperçu des données</h3>
            <div className="flex gap-2">
              {(['table', 'json', 'csv'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setPreviewFormat(format)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${previewFormat === format ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {previewFormat === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                    {Object.keys(EXAMPLE_AGENTS[0]).map(col => (
                      <th key={col} className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_AGENTS.map((agent, idx) => (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                      {Object.values(agent).map((val, colIdx) => (
                        <td key={colIdx} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {typeof val === 'string' && val.length > 30 ? val.substring(0, 27) + '...' : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {previewFormat === 'json' && (
            <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify({ metadata: { total: EXAMPLE_AGENTS.length }, agents: EXAMPLE_AGENTS }, null, 2)}
            </pre>
          )}

          {previewFormat === 'csv' && (
            <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
              {Papa.unparse(EXAMPLE_AGENTS)}
            </pre>
          )}
        </div>
      )}

      {/* Graphify Audit */}
      {showAuditGraph && <AuditGraphVisualization agents={EXAMPLE_AGENTS} />}

      {/* Instructions */}
      <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-6 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Points importants</h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>✓ Les emails doivent être uniques et au format valide</li>
              <li>✓ Les champs nom et prénom sont obligatoires</li>
              <li>✓ Le statut doit être : actif, inactif ou en_congé (minuscules)</li>
              <li>✓ La date_embauche au format YYYY-MM-DD</li>
              <li>✓ Le salaire_brut utilise un point comme séparateur décimal</li>
              <li>✓ Les doublons seront détectés automatiquement à l'import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditGraphVisualization({ agents }: { agents: TemplateData[] }) {
  const [graphStats, setGraphStats] = React.useState({
    totalAgents: agents.length,
    activeCount: 0,
    inactiveCount: 0,
    onLeaveCount: 0,
    bySpeciality: {} as Record<string, number>,
    salaryStats: { min: 0, max: 0, avg: 0 },
  });

  React.useEffect(() => {
    const salaries = agents.map(a => parseFloat(a.salaire_brut));
    setGraphStats({
      totalAgents: agents.length,
      activeCount:   agents.filter(a => a.statut === 'actif').length,
      inactiveCount: agents.filter(a => a.statut === 'inactif').length,
      onLeaveCount:  agents.filter(a => a.statut === 'en_congé').length,
      bySpeciality: agents.reduce((acc, a) => {
        acc[a.specialite] = (acc[a.specialite] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      salaryStats: {
        min: Math.min(...salaries),
        max: Math.max(...salaries),
        avg: salaries.reduce((s, v) => s + v, 0) / salaries.length,
      },
    });
  }, [agents]);

  const exportAudit = () => {
    const blob = new Blob([JSON.stringify({ timestamp: new Date().toISOString(), templateVersion: '1.0', statistics: graphStats, agents }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_graphify_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-600" /> Analyse Graphify
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total agents"  value={graphStats.totalAgents}   color="blue"  />
        <StatCard label="Actifs"        value={graphStats.activeCount}   color="green" />
        <StatCard label="Inactifs"      value={graphStats.inactiveCount} color="red"   />
        <StatCard label="En congé"      value={graphStats.onLeaveCount}  color="amber" />
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg p-6 mb-8">
        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Analyse salariale</h4>
        <div className="grid grid-cols-3 gap-4">
          {[['Minimum', graphStats.salaryStats.min], ['Moyenne', graphStats.salaryStats.avg], ['Maximum', graphStats.salaryStats.max]].map(([label, val]) => (
            <div key={label as string}>
              <p className="text-sm text-slate-600 dark:text-slate-400">{label as string}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">€{(val as number).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Distribution par spécialité</h4>
        <div className="space-y-3">
          {Object.entries(graphStats.bySpeciality).map(([speciality, count]) => (
            <div key={speciality} className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300">{speciality}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / graphStats.totalAgents) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={exportAudit} className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
        <Download className="w-5 h-5" /> Exporter rapport Graphify
      </button>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'blue' | 'green' | 'red' | 'amber' }) {
  const colorClass = {
    blue:  'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700',
    red:   'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700',
    amber: 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  };
  return (
    <div className={`p-4 rounded-lg border-2 ${colorClass[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
