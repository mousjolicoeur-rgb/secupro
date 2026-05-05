import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// ── Types ──────────────────────────────────────────────────────
interface AgentRow {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  carte_pro?: string;
  expiration_carte?: string | null;
  site_affectation?: string;
  heures?: number;
  specialite?: string;
  statut?: string;
  salaire_brut?: number | null;
  date_embauche?: string | null;
  numero_cnaps?: string;
  societe_id?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  agents: AgentRow[];
}

// ── CSV Parser ─────────────────────────────────────────────────
function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect separator: comma or semicolon
  const sep = lines[0].includes(";") ? ";" : ",";

  const headers = lines[0]
    .split(sep)
    .map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, ""));

  return lines.slice(1).map((line) => {
    // Handle quoted fields
    const values: string[] = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && !inQuote) { inQuote = true; continue; }
      if (ch === '"' && inQuote) { inQuote = false; continue; }
      if (ch === sep && !inQuote) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());

    return headers.reduce<Record<string, string>>((acc, h, i) => {
      acc[h] = (values[i] ?? "").trim();
      return acc;
    }, {});
  });
}

// ── Field normalizer ───────────────────────────────────────────
function normalizeDate(val: string | undefined): string | null {
  if (!val) return null;
  // Accepts: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const match = val.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return null;
}

function normalizeHeures(val: string | undefined): number {
  const n = parseFloat(val ?? "35");
  return isNaN(n) ? 35 : n;
}

function normalizeSalaire(val: string | undefined): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace(",", ".").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

function normalizeStatut(val: string | undefined): string {
  const v = (val ?? "actif").toLowerCase().trim();
  if (["actif", "active", "ok"].includes(v)) return "actif";
  if (["inactif", "inactive", "suspendu"].includes(v)) return "inactif";
  if (["expire", "expiré"].includes(v)) return "expire";
  return "actif"; // default
}

// ── Column aliases ─────────────────────────────────────────────
// Accepte différents noms de colonnes dans le CSV
function pick(row: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") return row[k];
  }
  return undefined;
}

// ── Main handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const societeId = formData.get("societe_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier CSV manquant" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Format invalide — fichier .csv requis" }, { status: 400 });
    }

    const raw = await file.text();
    const rows = parseCSV(raw);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Fichier CSV vide ou mal formaté" }, { status: 400 });
    }

    if (rows.length > 50) {
      return NextResponse.json(
        { error: `Limite dépassée : ${rows.length} lignes détectées. Maximum 50 agents par import.` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const result: ImportResult = { imported: 0, skipped: 0, errors: [], agents: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2 car header = ligne 1

      // Champs obligatoires
      const nom = pick(row, "nom", "nom_famille", "lastname", "last_name");
      const prenom = pick(row, "prenom", "prénom", "firstname", "first_name");

      if (!nom && !prenom) {
        result.errors.push(`Ligne ${lineNum} : nom et prénom manquants — ligne ignorée`);
        result.skipped++;
        continue;
      }

      // Construction de l'objet agent
      const agent: AgentRow = {
        nom:              nom ?? "",
        prenom:           prenom ?? "",
        email:            pick(row, "email", "mail", "e_mail") ?? "",
        telephone:        pick(row, "telephone", "téléphone", "tel", "phone") ?? "",

        // 🔑 Champs clés CNAPS
        carte_pro:        pick(row, "carte_pro", "carte", "numero_carte", "num_carte"),
        expiration_carte: normalizeDate(pick(row, "expiration_carte", "expiration", "date_expiration", "exp_carte")),
        numero_cnaps:     pick(row, "numero_cnaps", "cnaps", "num_cnaps"),

        // Affectation
        site_affectation: pick(row, "site_affectation", "site", "lieu", "affectation"),

        // Contrat
        heures:           normalizeHeures(pick(row, "heures", "heures_semaine", "heures_contrat", "h_sem")),
        specialite:       pick(row, "specialite", "spécialité", "qualification", "diplome"),
        statut:           normalizeStatut(pick(row, "statut", "status", "etat")),
        salaire_brut:     normalizeSalaire(pick(row, "salaire_brut", "salaire", "salary")),
        date_embauche:    normalizeDate(pick(row, "date_embauche", "embauche", "date_entree")),
      };

      // Ajout societe_id si fourni
      if (societeId) agent.societe_id = societeId;

      // Upsert sur email (évite les doublons)
      const { data, error } = await supabase
        .from("agents")
        .upsert(agent, {
          onConflict: agent.email ? "email" : "id",
          ignoreDuplicates: false,
        })
        .select("id, nom, prenom")
        .single();

      if (error) {
        result.errors.push(`Ligne ${lineNum} (${prenom} ${nom}) : ${error.message}`);
        result.skipped++;
      } else {
        result.imported++;
        result.agents.push(data);
      }
    }

    // Log dans import_audits si la table existe
    try {
      await supabase.from("import_audits").insert({
        societe_id: societeId,
        fichier: file.name,
        total_lignes: rows.length,
        importes: result.imported,
        ignores: result.skipped,
        erreurs: result.errors,
      });
    } catch (_) {
      // Table optionnelle — silencieux si absente
    }

    return NextResponse.json({
      success: true,
      message: `${result.imported} agent${result.imported > 1 ? "s" : ""} importé${result.imported > 1 ? "s" : ""} · ${result.skipped} ignoré${result.skipped > 1 ? "s" : ""}`,
      ...result,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
