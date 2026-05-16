import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Accepte une Date ou un timestamp Stripe (secondes). */
export function toTrialEndDate(trialEnd: Date | number | null | undefined): Date {
  if (trialEnd == null) {
    return new Date(Date.now() + 7 * 86_400_000);
  }
  if (trialEnd instanceof Date) {
    return trialEnd;
  }
  const ms = trialEnd < 1e12 ? trialEnd * 1000 : trialEnd;
  return new Date(ms);
}

const BASE_STYLES = `
  font-family: 'DM Sans', system-ui, sans-serif;
  background-color: #0a0d12;
  color: #f1f5f9;
  padding: 40px 20px;
  line-height: 1.6;
`;

const CONTAINER_STYLES = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 32px;
`;

const BUTTON_STYLES = `
  display: inline-block;
  background-color: #3B82F6;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 24px;
`;

const BTN_PRIMARY_SOCIETE = `
  display: inline-block;
  background-color: #00d1ff;
  color: #0B1426;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const BTN_SECONDARY_SOCIETE = `
  display: inline-block;
  background-color: transparent;
  color: #00d1ff;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid rgba(0, 209, 255, 0.45);
`;

/** Bienvenue espace société — essai 7 j (distinct du mail agents). */
export async function sendWelcomeSociete(
  email: string,
  societeNom: string,
  options?: { trialEnd?: Date | number | null; siret?: string | null },
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://secupro.app';
  const dashboardUrl = `${appUrl}/espace-societe/dashboard`;
  const tarifsUrl = `${appUrl}/tarifs-entreprise`;

  const end = toTrialEndDate(options?.trialEnd ?? null);
  const dateExpiration = end.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const safeNom = htmlEscape(societeNom.trim() || 'Client');
  const rawSiret = (options?.siret ?? '').replace(/\s/g, '');
  const siretLine =
    rawSiret.length > 0
      ? `SIRET ${htmlEscape(rawSiret)}`
      : 'SIRET (à renseigner dans votre espace)';

  const headerBg = '#0B1426';
  const bodyBg = '#0a0f18';

  return resend.emails.send({
    from: 'SecuPRO <noreply@secupro.app>',
    to: email,
    subject: 'Votre essai SecuPRO démarre maintenant — 1 mois offert',
    html: `
      <div style="margin:0;padding:0;background:${bodyBg};font-family:'DM Sans',system-ui,sans-serif;color:#e2e8f0;line-height:1.55;">
        <div style="max-width:640px;margin:0 auto;">
          <!-- Header -->
          <div style="background:${headerBg};padding:28px 24px;text-align:center;border-bottom:1px solid rgba(0,209,255,0.2);">
            <span style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;letter-spacing:3px;">
              <span style="color:#ffffff;">Secu</span><span style="color:#00aaff;">PRO</span>
            </span>
            <p style="margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:0.35em;text-transform:uppercase;color:rgba(0,209,255,0.5);">
              Business
            </p>
          </div>

          <div style="padding:32px 28px 40px;background:#111a2a;border:1px solid rgba(0,209,255,0.12);border-top:none;border-radius:0 0 14px 14px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f8fafc;">
              Bienvenue sur SecuPRO, ${safeNom} 👋
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;">
              Votre essai gratuit d'1 mois commence aujourd'hui
            </p>

            <!-- Compte à rebours -->
            <div style="background:rgba(0,209,255,0.08);border:1px solid rgba(0,209,255,0.25);border-radius:12px;padding:18px 20px;margin-bottom:28px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:rgba(0,209,255,0.75);">
                1 mois · Essai actif
              </p>
              <p style="margin:8px 0 0;font-size:15px;font-weight:600;color:#f1f5f9;">
                jusqu'au ${htmlEscape(dateExpiration)}
              </p>
            </div>

            <h2 style="margin:0 0 14px;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#00d1ff;">
              Vos prochaines étapes
            </h2>
            <ol style="margin:0 0 28px;padding-left:22px;color:#cbd5e1;font-size:14px;">
              <li style="margin-bottom:10px;">Importer vos agents (CSV)</li>
              <li style="margin-bottom:10px;">Configurer vos sites</li>
              <li style="margin-bottom:0;">Importer votre planning</li>
            </ol>

            <div style="margin-bottom:8px;">
              <a href="${dashboardUrl}" style="${BTN_PRIMARY_SOCIETE}">
                ACCÉDER À MON DASHBOARD →
              </a>
            </div>
            <div style="margin-top:4px;">
              <a href="${tarifsUrl}" style="${BTN_SECONDARY_SOCIETE}">
                Choisir mon abonnement
              </a>
            </div>
          </div>

          <p style="text-align:center;font-size:11px;color:#64748b;padding:20px 16px 32px;margin:0;">
            contact@secupro.app · ${siretLine} · RGPD — données traitées conformément au règlement européen sur la protection des données
          </p>
        </div>
      </div>
    `,
  });
}

export const sendWelcomeB2BEmail = async (email: string, societeNom: string, plan: string) => {
  return resend.emails.send({
    from: 'SecuPRO <contact@secupro.app>',
    to: email,
    subject: 'Bienvenue sur SecuPRO — votre compte est activé',
    html: `
      <div style="${BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <h1 style="color: #3B82F6; font-size: 24px; margin-bottom: 8px;">SecuPRO</h1>
          <h2 style="font-size: 20px; margin-bottom: 24px;">Bienvenue, ${societeNom} !</h2>
          <p>Votre compte SecuPRO vient d'être activé avec succès sur le plan <strong>${plan}</strong>.</p>
          <p>Voici les 5 étapes pour bien démarrer :</p>
          <ol style="color: #9ca3af;">
            <li>Complétez votre profil entreprise</li>
            <li>Importez vos agents via CSV</li>
            <li>Générez un code d'invitation Portail Pro</li>
            <li>Importez vos premiers plannings</li>
            <li>Suivez vos performances en temps réel</li>
          </ol>
          <a href="https://secupro.app/agents" style="${BUTTON_STYLES}">Accéder au Dashboard</a>
          <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">Besoin d'aide ? Contactez notre support : contact@secupro.app</p>
        </div>
      </div>
    `,
  });
};

export const sendAgentAccessEmail = async (email: string, prenom: string, societeNom: string) => {
  return resend.emails.send({
    from: 'SecuPRO <contact@secupro.app>',
    to: email,
    subject: 'Votre accès SecuPRO est prêt',
    html: `
      <div style="${BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <h1 style="color: #3B82F6; font-size: 24px; margin-bottom: 8px;">SecuPRO</h1>
          <h2 style="font-size: 20px; margin-bottom: 24px;">Bonjour ${prenom},</h2>
          <p>Félicitations ! Vous êtes désormais rattaché à <strong>${societeNom}</strong> sur SecuPRO.</p>
          <p>Votre HUB Agent centralise 6 modules indispensables pour votre quotidien :</p>
          <ul style="color: #9ca3af;">
            <li>🗓️ <strong>Planning</strong> : Vos vacations en temps réel</li>
            <li>💶 <strong>Paie</strong> : Vos fiches de paie et alertes IA</li>
            <li>📂 <strong>Documents</strong> : Vos contrats et attestations</li>
            <li>🤖 <strong>SecuIA</strong> : Votre assistant juridique IDCC 1351</li>
            <li>📰 <strong>Actualités</strong> : Le fil info Sécurité Privée</li>
            <li>⚖️ <strong>SecuDroit</strong> : La bible des droits de l'agent</li>
          </ul>
          <a href="https://secupro.app/agent/hub" style="${BUTTON_STYLES}">Ouvrir le HUB Agent</a>
        </div>
      </div>
    `,
  });
};

export const sendActivationCodeEmail = async (
  email: string,
  societeNom: string,
  plan: string,
  activationCode: string,
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://secupro.app";
  const activationUrl = `${appUrl}/espace-societe/activation`;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return resend.emails.send({
    from: "SecuPRO <noreply@secupro.app>",
    to: email,
    subject: `SecuPRO — Votre code d'activation ${planLabel}`,
    html: `
      <div style="${BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <div style="text-align:center; margin-bottom:28px;">
            <span style="font-family:'Rajdhani',sans-serif; font-size:28px; font-weight:700; letter-spacing:3px;">
              <span style="color:#fff;">Secu</span><span style="color:#00aaff;">PRO</span>
            </span>
          </div>

          <h2 style="font-size:20px; color:#f1f5f9; margin-bottom:6px;">
            Abonnement activé — Plan ${planLabel}
          </h2>
          <p style="color:#9ca3af; margin-bottom:28px;">
            Bonjour ${societeNom},<br>
            Votre paiement a bien été reçu. Utilisez le code ci-dessous pour débloquer
            l'accès complet à votre espace SecuPRO Business.
          </p>

          <!-- Code d'activation -->
          <div style="background:#0f172a; border:1px solid rgba(0,209,255,0.25);
                      border-radius:12px; padding:24px; text-align:center; margin-bottom:28px;">
            <p style="color:rgba(0,209,255,0.6); font-size:11px; font-weight:700;
                      letter-spacing:0.4em; text-transform:uppercase; margin:0 0 12px;">
              Votre code d'activation
            </p>
            <p style="color:#00d1ff; font-size:28px; font-weight:900;
                      letter-spacing:6px; margin:0; font-family:monospace;">
              ${activationCode}
            </p>
            <p style="color:#6b7280; font-size:11px; margin:10px 0 0;">
              À usage unique · Valable indéfiniment
            </p>
          </div>

          <a href="${activationUrl}" style="${BUTTON_STYLES}; background:#00d1ff; color:#0a0d12; border-radius:8px;">
            Activer mon accès maintenant →
          </a>

          <div style="margin-top:32px; padding-top:24px; border-top:1px solid #1f2937;">
            <p style="color:#6b7280; font-size:13px; margin:0 0 8px;">
              <strong style="color:#9ca3af;">Plan souscrit :</strong> ${planLabel}
            </p>
            <p style="color:#6b7280; font-size:13px; margin:0;">
              Conservez ce code précieusement. En cas de perte, contactez
              <a href="mailto:support@secupro.app" style="color:#00d1ff;">support@secupro.app</a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

/** Rappel fin d’essai (webhook Stripe trial_will_end — en général ~3 j avant la fin) */
export const sendTrialEndingReminderEmail = async (
  email: string,
  societeNom: string,
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://secupro.app";
  const billingUrl = `${appUrl}/espace-societe/support`;

  return resend.emails.send({
    from: "SecuPRO <noreply@secupro.app>",
    to: email,
    subject: "SecuPRO — Votre essai gratuit se termine bientôt",
    html: `
      <div style="${BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <h1 style="color: #00d1ff; font-size: 22px; margin-bottom: 8px;">SecuPRO Business</h1>
          <h2 style="font-size: 18px; margin-bottom: 16px;">Bonjour ${societeNom},</h2>
          <p style="color: #e2e8f0;">
            Votre <strong>essai gratuit d'1 mois</strong> arrive à son terme dans environ
            <strong>2 à 3 jours</strong> (rappel automatique Stripe).
          </p>
          <p style="color: #9ca3af;">
            Aucun changement tant que l’essai est actif : vous continuez à profiter de SecuPRO
            sans débit supplémentaire jusqu’à la date de renouvellement. Vous pouvez gérer votre
            abonnement ou annuler à tout moment depuis votre espace.
          </p>
          <a href="${billingUrl}" style="${BUTTON_STYLES}; background:#00d1ff; color:#0a0d12;">
            Gérer mon abonnement
          </a>
          <p style="margin-top:24px; font-size:13px; color:#6b7280;">
            Besoin d’aide ? <a href="mailto:support@secupro.app" style="color:#00d1ff;">support@secupro.app</a>
          </p>
        </div>
      </div>
    `,
  });
};

export const sendCarteProAlertEmail = async (email: string, agentNom: string, prenom: string, expireLe: string, urgency: 'informatif' | 'urgent' | 'critique', jRestant: number) => {
  const isCritique = urgency === 'critique';
  return resend.emails.send({
    from: 'SecuPRO Alertes <contact@secupro.app>',
    to: email,
    subject: `Alerte CNAPS : Carte pro expirant à J-${jRestant} (${prenom} ${agentNom})`,
    html: `
      <div style="${BASE_STYLES}">
        <div style="${CONTAINER_STYLES}; border-color: ${isCritique ? '#ef4444' : '#1f2937'};">
          <h1 style="color: #3B82F6; font-size: 24px; margin-bottom: 8px;">SecuPRO</h1>
          <h2 style="font-size: 20px; color: ${isCritique ? '#ef4444' : '#ffffff'}; margin-bottom: 24px;">
            Alerte Expiration Carte Professionnelle
          </h2>
          <p>Attention, la carte professionnelle de l'agent <strong>${prenom} ${agentNom}</strong> arrive à expiration dans <strong>${jRestant} jours</strong> (le ${expireLe}).</p>
          <p>Rappel : un agent ne peut en aucun cas exercer avec une carte professionnelle expirée.</p>
          
          ${isCritique ? `
            <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 8px; margin-top: 24px;">
              <p style="color: #ef4444; margin: 0; font-weight: bold;">⚠️ Situation Critique !</p>
              <p style="color: #fca5a5; margin-top: 8px; font-size: 14px;">Veuillez urgemment suspendre les affectations de cet agent s'il n'a pas transmis de récépissé de renouvellement.</p>
              <a href="https://macartepro.cnaps.interieur.gouv.fr" style="display: block; margin-top: 12px; color: #ef4444; text-decoration: underline;">Vérifier sur le portail du CNAPS</a>
            </div>
          ` : ''}
          
          <a href="https://secupro.app/agents" style="${BUTTON_STYLES}">Gérer les effectifs</a>
        </div>
      </div>
    `,
  });
};
