'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader, Download } from 'lucide-react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

type AgentRow = {
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  statut?: string;
  date_embauche?: string;
  specialite?: string;
  salaire_brut?: string;
};

type ImportResult = {
  success: boolean;
  totalRows?: number;
  successful?: number;
  failed?: number;
  duplicates?: number;
  batchId?: string;
  auditId?: string;
};

export default function ProvisioningUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setOrgId((session.user as any).org_id ?? null);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
      setResult(null);
    }
  };

  const validateRow = (row: AgentRow, index: number): string[] => {
    const rowErrors: string[] = [];

    if (!row.email || !row.email.includes('@'))
      rowErrors.push(`Ligne ${index + 1}: Email invalide`);
    if (!row.nom || row.nom.trim().length === 0)
      rowErrors.push(`Ligne ${index + 1}: Nom manquant`);
    if (!row.prenom || row.prenom.trim().length === 0)
      rowErrors.push(`Ligne ${index + 1}: Prénom manquant`);
    if (row.statut && !['actif', 'inactif', 'en_congé'].includes(row.statut.toLowerCase()))
      rowErrors.push(`Ligne ${index + 1}: Statut invalide (actif/inactif/en_congé)`);
    if (row.salaire_brut && isNaN(parseFloat(row.salaire_brut)))
      rowErrors.push(`Ligne ${index + 1}: Salaire invalide`);

    return rowErrors;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setErrors([]);

    try {
      Papa.parse<AgentRow>(file, {
        complete: async (results) => {
          const rows = results.data.filter(row => row.email);
          const batchId = uuidv4();
          const uploadErrors: string[] = [];
          const validRows: AgentRow[] = [];
          const duplicateEmails = new Set<string>();

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowValidationErrors = validateRow(row, i);

            if (rowValidationErrors.length > 0) {
              uploadErrors.push(...rowValidationErrors);
            } else if (duplicateEmails.has(row.email)) {
              uploadErrors.push(`Ligne ${i + 1}: Email en doublon dans le fichier`);
            } else {
              duplicateEmails.add(row.email);
              validRows.push(row);
            }

            setProgress(Math.round((i / rows.length) * 30));
          }

          if (validRows.length > 0) {
            try {
              const response = await fetch('/api/provisioning/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agents: validRows,
                  batchId,
                  filename: file.name,
                  totalRows: rows.length,
                  orgId,
                }),
              });

              const importResult = await response.json();

              if (response.ok) {
                setProgress(100);
                setResult({
                  success: true,
                  totalRows: rows.length,
                  successful: importResult.successful,
                  failed: importResult.failed,
                  duplicates: importResult.duplicates,
                  batchId: importResult.batchId,
                  auditId: importResult.auditId,
                });
              } else {
                uploadErrors.push(`Erreur serveur: ${importResult.error}`);
                setResult({ success: false });
              }
            } catch (error: any) {
              uploadErrors.push(`Erreur réseau: ${error.message}`);
              setResult({ success: false });
            }
          }

          setErrors(uploadErrors);
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          setErrors([`Erreur parsing CSV: ${error.message}`]);
          setResult({ success: false });
        },
      });
    } catch (error: any) {
      setErrors([`Erreur: ${error.message}`]);
      setResult({ success: false });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'email,nom,prenom,telephone,adresse,statut,date_embauche,specialite,salaire_brut\nexample@domain.com,Dupont,Pierre,0601020304,123 Rue de Paris,actif,2024-01-15,Sécurité Événementielle,2500.00';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_agents.csv';
    a.click();
  };

  const downloadAuditReport = async (auditId: string) => {
    try {
      const response = await fetch(`/api/provisioning/audit/${auditId}`);
      const audit = await response.json();

      const csv = `Rapport d'import - ${audit.filename}
Date: ${new Date(audit.created_at).toLocaleDateString('fr-FR')}
Total: ${audit.total_rows}
Importés: ${audit.successful_imports}
Échoués: ${audit.failed_imports}
Doublons: ${audit.duplicates_found}

Erreurs détaillées:
${JSON.stringify(audit.errors, null, 2)}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_${auditId}.csv`;
      a.click();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Import Massif d'Agents</h1>
        <p className="text-slate-600 dark:text-slate-400">Importez vos agents via CSV</p>
      </div>

      <button
        onClick={downloadTemplate}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Télécharger template CSV
      </button>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 mb-6"
      >
        <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <p className="text-slate-900 dark:text-white font-semibold mb-1">
          {file ? file.name : 'Cliquez pour sélectionner ou glissez votre fichier CSV'}
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Format: email, nom, prenom, telephone, adresse, statut, date_embauche, specialite, salaire_brut
        </p>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full mb-6 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
      >
        {uploading ? (
          <><Loader className="w-5 h-5 animate-spin" />Upload en cours...</>
        ) : (
          "Lancer l'import"
        )}
      </button>

      {uploading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{progress}%</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Erreurs détectées :</h3>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                {errors.slice(0, 10).map((error, idx) => <li key={idx}>• {error}</li>)}
                {errors.length > 10 && <li>... et {errors.length - 10} autres erreurs</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {result?.success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">Import réussi !</h3>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                {result.successful} agent(s) importé(s) avec succès
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 bg-white dark:bg-slate-800 p-4 rounded">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total traité</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.totalRows}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Échoués</p>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Doublons</p>
              <p className="text-2xl font-bold text-amber-600">{result.duplicates}</p>
            </div>
          </div>

          <button
            onClick={() => result.auditId && downloadAuditReport(result.auditId)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger rapport d'audit
          </button>
        </div>
      )}
    </div>
  );
}
