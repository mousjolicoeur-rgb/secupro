'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Building2, Users, Settings, AlertCircle, CheckCircle,
  Loader, Eye, EyeOff, Download, ArrowRight, ArrowLeft,
} from 'lucide-react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

type Step = 'organization' | 'upload' | 'preview' | 'confirm' | 'results';

interface OrganizationData {
  companyName: string;
  siret: string;
  contactEmail: string;
  contactPhone: string;
  sector: string;
  agentsCount: number;
}

interface AgentRow {
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

interface ValidationError {
  row: number;
  email: string;
  error: string;
}

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'organization', label: 'Organisation', icon: Building2 },
  { key: 'upload',       label: 'Import CSV',   icon: Upload    },
  { key: 'preview',      label: 'Aperçu',       icon: Eye       },
  { key: 'confirm',      label: 'Confirmation', icon: Settings  },
  { key: 'results',      label: 'Résultats',    icon: CheckCircle },
];

const SECTORS = [
  { value: 'evenementiel',  label: 'Sécurité Événementielle' },
  { value: 'gardiennage',   label: 'Gardiennage & Surveillance' },
  { value: 'cynophile',     label: 'Cynophile (Maître-Chien)'  },
  { value: 'incendie',      label: 'Sécurité Incendie'         },
  { value: 'transport',     label: 'Transport de Fonds'        },
  { value: 'autres',        label: 'Autres'                    },
];

export default function ProvisioningInterface() {
  const [step, setStep] = useState<Step>('organization');
  const [orgData, setOrgData] = useState<OrganizationData>({
    companyName: '', siret: '', contactEmail: '',
    contactPhone: '', sector: 'autres', agentsCount: 0,
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [societeId, setSocieteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState<string>('gratuit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkPlan() {
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const societeIdMock = '11111111-1111-1111-1111-111111111111'; // Mock
        const { data } = await supabase.from('societes').select('plan').eq('id', societeIdMock).single();
        setPlan(data?.plan || 'gratuit');
      } catch (err) {
        console.error(err);
      }
    }
    checkPlan();
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────

  const validateOrg = () => {
    const errors: string[] = [];
    if (!orgData.companyName.trim()) errors.push("Nom de l'entreprise requis");
    if (!/^\d{14}$/.test(orgData.siret.replace(/\s/g, ''))) errors.push('SIRET invalide (14 chiffres)');
    if (!orgData.contactEmail.includes('@')) errors.push('Email invalide');
    if (!/^(\+33|0)[1-9]\d{8}$/.test(orgData.contactPhone.replace(/\s/g, ''))) errors.push('Téléphone invalide');
    if (orgData.agentsCount < 1) errors.push("Nombre d'agents doit être ≥ 1");
    if (errors.length > 0) { alert('Erreurs:\n' + errors.join('\n')); return false; }
    return true;
  };

  // ── CSV parsing ───────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCsvFile(file); setValidationErrors([]); }
  };

  const parseCSV = () => {
    if (!csvFile) return;
    setUploading(true);
    setProgress(10);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data as any[]).filter(r => r.email?.trim());
        const errors: ValidationError[] = [];
        const valid: AgentRow[] = [];
        const seen = new Set<string>();

        const limit = plan === 'essentiel' ? 25 : (plan === 'pro' || plan === 'premium' ? Infinity : 5);
        if (rows.length > limit) {
          alert(`Votre plan ${plan} vous limite à ${limit} agents. Veuillez mettre à niveau votre plan pour importer ${rows.length} agents.`);
          setUploading(false);
          return;
        }

        rows.forEach((row, idx) => {
          const email = row.email.trim().toLowerCase();
          if (seen.has(email)) {
            errors.push({ row: idx + 2, email: row.email, error: 'Email en doublon dans le fichier' });
            return;
          }
          if (!email.includes('@')) {
            errors.push({ row: idx + 2, email: row.email, error: 'Email invalide' });
            return;
          }
          if (!row.nom?.trim() || !row.prenom?.trim()) {
            errors.push({ row: idx + 2, email: row.email, error: 'Nom ou prénom manquant' });
            return;
          }
          if (row.statut && !['actif', 'inactif', 'en_congé'].includes(row.statut)) {
            errors.push({ row: idx + 2, email: row.email, error: 'Statut invalide' });
            return;
          }
          if (row.salaire_brut && isNaN(parseFloat(row.salaire_brut))) {
            errors.push({ row: idx + 2, email: row.email, error: 'Salaire invalide' });
            return;
          }
          seen.add(email);
          valid.push({ ...row, email });
          setProgress(10 + Math.round((idx / rows.length) * 50));
        });

        setAgents(valid);
        setValidationErrors(errors);
        setProgress(100);
        setUploading(false);
        setStep('preview');
      },
      error: () => { setUploading(false); },
    });
  };

  // ── Org form next ─────────────────────────────────────────────────────────

  const handleOrgFormNext = async () => {
    if (!validateOrg()) return;
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      console.log('Inserting societe...', orgData);
      const { data: newSociete, error } = await supabase
        .from('societes')
        .insert({
          nom: orgData.companyName,
          siret: orgData.siret.replace(/\s/g, ''),
          email_contact: orgData.contactEmail,
          telephone: orgData.contactPhone,
          secteur: orgData.sector,
          nb_agents: orgData.agentsCount,
        })
        .select()
        .single();
      if (error) { alert('Erreur création société : ' + error.message); return; }
      console.log('Societe created:', newSociete);
      console.log('SocieteId set:', newSociete?.id);
      setSocieteId(newSociete.id);
      setStep('upload');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  };

  // ── Import ────────────────────────────────────────────────────────────────

  const handleConfirmImport = async () => {
    console.log('Submitting with societeId:', societeId);
    console.log('Agents count:', agents.length);
    if (!societeId) { alert("societeId manquant — veuillez recommencer depuis l'étape organisation"); return; }
    if (!csvFile) { alert('Fichier CSV manquant'); return; }
    setUploading(true);
    setProgress(0);
    try {
      const csvContent = await csvFile.text();
      const batchId = uuidv4();
      const response = await fetch('/api/provisioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societeId,
          filename: csvFile.name,
          csvContent
        }),
      });
      const data = await response.json();
      setProgress(100);
      
      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'import");
      }
      
      setResults({
        batchId,
        successful: data.data.nb_succes,
        failed: data.data.nb_erreurs,
        duplicates: 0 // Comptabilisé dans nb_erreurs ici
      });
      setStep('results');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Step renderer ─────────────────────────────────────────────────────────

  const currentIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done    = idx < currentIdx;
          const active  = idx === currentIdx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${done ? 'bg-green-500 border-green-500 text-white' : active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${idx < currentIdx ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step: Organization */}
      {step === 'organization' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-600" /> Informations Organisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nom de l'entreprise *" value={orgData.companyName} onChange={v => setOrgData(p => ({ ...p, companyName: v }))} placeholder="SecuPRO SAS" />
            <Field label="SIRET *" value={orgData.siret} onChange={v => setOrgData(p => ({ ...p, siret: v }))} placeholder="123 456 789 00012" />
            <Field label="Email de contact *" value={orgData.contactEmail} onChange={v => setOrgData(p => ({ ...p, contactEmail: v }))} placeholder="contact@secupro.fr" type="email" />
            <Field label="Téléphone *" value={orgData.contactPhone} onChange={v => setOrgData(p => ({ ...p, contactPhone: v }))} placeholder="06 01 02 03 04" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secteur</label>
              <select value={orgData.sector} onChange={e => setOrgData(p => ({ ...p, sector: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <Field label="Nombre d'agents *" value={String(orgData.agentsCount)} onChange={v => setOrgData(p => ({ ...p, agentsCount: parseInt(v) || 0 }))} placeholder="50" type="number" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleOrgFormNext} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
              Suivant <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Upload className="w-7 h-7 text-blue-600" /> Import CSV Agents
          </h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-12 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            <Upload className="w-14 h-14 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {csvFile ? csvFile.name : 'Cliquez pour sélectionner votre fichier CSV'}
            </p>
            <p className="text-sm text-slate-500">email, nom, prenom, telephone, adresse, statut, date_embauche, specialite, salaire_brut</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
          </div>
          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-slate-500 text-center">{progress}% — Analyse en cours…</p>
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep('organization')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600">
              <ArrowLeft className="w-5 h-5" /> Retour
            </button>
            <button onClick={parseCSV} disabled={!csvFile || uploading} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:bg-slate-400">
              {uploading ? <><Loader className="w-5 h-5 animate-spin" /> Analyse…</> : <>Analyser <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Eye className="w-7 h-7 text-blue-600" /> Aperçu ({agents.length} agent{agents.length > 1 ? 's' : ''} valides)
          </h2>
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {validationErrors.length} ligne{validationErrors.length > 1 ? 's' : ''} ignorée{validationErrors.length > 1 ? 's' : ''}
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.slice(0, 5).map((e, i) => <li key={i}>Ligne {e.row} ({e.email}) — {e.error}</li>)}
                {validationErrors.length > 5 && <li>… et {validationErrors.length - 5} autres</li>}
              </ul>
            </div>
          )}
          <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                <tr>
                  {['Email', 'Nom', 'Prénom', 'Statut', 'Spécialité', 'Salaire'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((a, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{a.email}</td>
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{a.nom}</td>
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{a.prenom}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.statut === 'actif' ? 'bg-green-100 text-green-800' : a.statut === 'en_congé' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>{a.statut}</span>
                    </td>
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{a.specialite || '—'}</td>
                    <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{a.salaire_brut ? `€${parseFloat(a.salaire_brut).toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep('upload')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600">
              <ArrowLeft className="w-5 h-5" /> Retour
            </button>
            <button onClick={() => setStep('confirm')} disabled={agents.length === 0} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:bg-slate-400">
              Confirmer <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" /> Confirmation
          </h2>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 space-y-3">
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Organisation :</span> {orgData.companyName}</p>
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">SIRET :</span> {orgData.siret}</p>
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Secteur :</span> {SECTORS.find(s => s.value === orgData.sector)?.label}</p>
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Agents à importer :</span> {agents.length}</p>
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Lignes ignorées :</span> {validationErrors.length}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            Cette action importera {agents.length} agent{agents.length > 1 ? 's' : ''} dans la base de données. Cette opération est irréversible.
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep('preview')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600">
              <ArrowLeft className="w-5 h-5" /> Retour
            </button>
            <button onClick={handleConfirmImport} disabled={uploading} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:bg-slate-400">
              {uploading ? <><Loader className="w-5 h-5 animate-spin" /> Import en cours…</> : <><CheckCircle className="w-5 h-5" /> Lancer l'import</>}
            </button>
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && results && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Import terminé</h2>
              <p className="text-slate-500 dark:text-slate-400">Batch ID : <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{results.batchId}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ResultCard label="Importés" value={results.successful} color="green" />
            <ResultCard label="Échoués"  value={results.failed}     color="red"   />
            <ResultCard label="Doublons" value={results.duplicates} color="amber" />
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStep('organization'); setAgents([]); setCsvFile(null); setResults(null); setValidationErrors([]); setSocieteId(null); }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Nouvel import
            </button>
            <button
              onClick={() => router.push('/performance')}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold"
            >
              Voir Dashboard Performance
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: number; color: 'green' | 'red' | 'amber' }) {
  const cls = {
    green: 'bg-green-500 text-white border-green-600',
    red:   'bg-red-500 text-white border-red-600',
    amber: 'bg-amber-500 text-white border-amber-600',
  };
  return (
    <div className={`p-6 rounded-lg border-2 text-center ${cls[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
