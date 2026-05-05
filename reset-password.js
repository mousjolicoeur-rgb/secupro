/**
 * reset-password.js
 * Réinitialise le mot de passe d'un utilisateur Supabase via le service role key.
 * Usage : node reset-password.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Chargement de .env.local ─────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌  Fichier .env.local introuvable.');
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const SUPABASE_URL      = 'https://ladvecmpjpictubnnnsq.supabase.co';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL      = 'contact@secupro.app';
const NEW_PASSWORD      = 'Secupro2026!';

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('\n🔑  SecuPRO — Réinitialisation du mot de passe\n');

  // 1. Retrouver l'utilisateur par email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌  Impossible de lister les utilisateurs :', listErr.message);
    process.exit(1);
  }

  const user = users.find(u => u.email === TARGET_EMAIL);
  if (!user) {
    console.error(`❌  Aucun utilisateur trouvé avec l'email : ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log(`✅  Utilisateur trouvé : ${user.email} (id: ${user.id})`);

  // 2. Mettre à jour le mot de passe
  const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: NEW_PASSWORD,
    email_confirm: true,
  });

  if (updateErr) {
    console.error('❌  Mise à jour échouée :', updateErr.message);
    process.exit(1);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email    : ${TARGET_EMAIL}`);
  console.log(`  Password : ${NEW_PASSWORD}`);
  console.log(`  User ID  : ${user.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉  Mot de passe réinitialisé avec succès.\n');
}

main().catch(err => {
  console.error('❌  Erreur inattendue :', err);
  process.exit(1);
});
