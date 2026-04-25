import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

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

export const sendCarteProAlertEmail = async (email: string, agentNom: string, prenom: string, expireLe: string, urgency: 'informatif' | 'urgent' | 'critique', jRestant: number) => {
  const isCritique = urgency === 'critique';
  return resend.emails.send({
    from: 'SecuPRO Alertes <contact@secupro.app>',
    to: email,
    subject: \`Alerte CNAPS : Carte pro expirant à J-\${jRestant} (\${prenom} \${agentNom})\`,
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
