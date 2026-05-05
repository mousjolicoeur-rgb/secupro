/**
 * create-admin.js
 * Crée un utilisateur admin dans Supabase et configure son profil.
 * Usage : node create-admin.js
 *
 * Prérequis : SUPABASE_SERVICE_ROLE_KEY défini dans .env.local
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Chargement manuel de .env.local ─────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌  Fichier .env.local introuvable à la racine du projet.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

// ── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL     = 'https://ladvecmpjpictubnnnsq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL    = 'contact@secupro.app';
const ADMIN_PASSWORD = 'Secupro2026!';

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Script principal ─────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧  SecuPRO — Création du compte admin\n');

  // 1. Vérifier si l'utilisateur existe déjà
  const { data: existingList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌  Impossible de lister les utilisateurs :', listErr.message);
    process.exit(1);
  }

  let userId = existingList.users.find(u => u.email === ADMIN_EMAIL)?.id ?? null;

  if (userId) {
    console.log(`ℹ️   Utilisateur ${ADMIN_EMAIL} déjà existant (id: ${userId})`);
    console.log('    Mise à jour du mot de passe...');
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) {
      console.error('❌  Mise à jour échouée :', updateErr.message);
      process.exit(1);
    }
    console.log('✅  Mot de passe mis à jour.');
  } else {
    // 2. Créer l'utilisateur
    console.log(`➕  Création de l'utilisateur ${ADMIN_EMAIL}...`);
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email:            ADMIN_EMAIL,
      password:         ADMIN_PASSWORD,
      email_confirm:    true,   // confirmation email ignorée — accès direct
    });
    if (createErr) {
      console.error('❌  Création échouée :', createErr.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`✅  Utilisateur créé (id: ${userId})`);
  }

  // 3. Upsert du profil admin
  console.log('    Configuration du profil admin...');
  const { error: profileErr } = await supabase.from('profiles').upsert(
    {
      id:          userId,
      email:       ADMIN_EMAIL,
      is_approved: true,
    },
    { onConflict: 'id' }
  );

  if (profileErr) {
    console.error('❌  Upsert profiles échoué :', profileErr.message);
    process.exit(1);
  }

  console.log('✅  Profil mis à jour : is_approved = true\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  User ID  : ${userId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉  Admin opérationnel — vous pouvez vous connecter sur secupro.app/login\n');
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err);
  process.exit(1);
});
