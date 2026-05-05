-- 1. Création de la table articles_droit
CREATE TABLE IF NOT EXISTS articles_droit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_article text NOT NULL,
  titre text NOT NULL,
  resume text,
  contenu text NOT NULL,
  categorie text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Activation de RLS (Row Level Security)
ALTER TABLE articles_droit ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les agents authentifiés
CREATE POLICY "Les agents authentifiés peuvent lire les articles_droit"
ON articles_droit
FOR SELECT
TO authenticated
USING (true);

-- 3. Insertion des 38 articles de base (IDCC 1351, CNAPS, Code du Travail)
INSERT INTO articles_droit (numero_article, titre, resume, contenu, categorie) VALUES
-- IDCC 1351
('Art. 7', 'Période d''essai', 'Durée de la période d''essai selon la classification.', 'Pour les employés (coefficient 120 à 150) : 2 mois, renouvelable 1 fois pour une durée maximale d''un mois. L''employeur et le salarié peuvent y mettre fin sous réserve du respect du délai de prévenance prévu par le Code du travail.', 'idcc_1351'),
('Art. 8.2', 'Prime de panier', 'Conditions d''attribution de la prime de panier.', 'Une indemnité de panier est attribuée à l''agent effectuant une vacation d''au moins 6 heures continues. Cette prime n''est pas due si l''agent prend son repas à son domicile ou si le repas est fourni gratuitement par l''employeur ou le client.', 'idcc_1351'),
('Art. 8.3', 'Prime d''habillage', 'Indemnité forfaitaire pour le port de la tenue.', 'Dès lors que le port d''une tenue de travail est imposé par l''employeur, et que l''habillage et le déshabillage doivent être réalisés sur le lieu de travail, une indemnité d''habillage est versée. Elle est forfaitaire et fixée selon l''accord de branche annuel.', 'idcc_1351'),
('Art. 9', 'Classification des emplois', 'Grille de classification des coefficients.', 'La grille s''articule autour de coefficients allant de 120 (Agent de sécurité qualifié) à 150 (Chef de poste), voire plus pour les cadres. Le coefficient détermine le taux horaire de base et les qualifications requises (CQP APS, SSIAP, etc.).', 'idcc_1351'),
('Art. 10.1', 'Remplacement d''un agent', 'Règles en cas de remplacement inopiné.', 'En cas d''absence imprévue d''un agent, l''employeur peut demander à un autre agent de prolonger sa vacation ou d''effectuer un remplacement, dans le respect absolu des limites légales de durée de travail et de repos.', 'idcc_1351'),

-- Temps de travail
('L3121-18', 'Durée maximale quotidienne', '12 heures consécutives maximum.', 'La durée quotidienne du travail ne peut excéder 12 heures dans la sécurité privée, par dérogation à la règle des 10 heures, en raison de la nature spécifique des activités de garde et de surveillance.', 'temps_travail'),
('L3121-20', 'Durée maximale hebdomadaire', '48 heures sur une semaine isolée.', 'Au cours d''une même semaine, la durée du travail ne peut dépasser 48 heures absolues. Sur une période de 12 semaines consécutives, la durée moyenne ne peut excéder 44 heures ou 46 heures selon l''accord d''entreprise.', 'temps_travail'),
('L3131-1', 'Repos quotidien', '11 heures consécutives de repos minimum.', 'Tout agent a droit à un repos quotidien d''une durée minimale de 11 heures consécutives entre la fin d''une vacation et le début de la suivante.', 'temps_travail'),
('L3132-2', 'Repos hebdomadaire', 'Le repos hebdomadaire de 35h.', 'Le repos hebdomadaire a une durée minimale de 24 heures consécutives, auxquelles s''ajoutent les 11 heures de repos quotidien, soit 35 heures consécutives au total.', 'temps_travail'),
('L3122-2', 'Travail de nuit - Définition', 'Horaires considérés comme travail de nuit.', 'Est considéré comme travail de nuit tout travail accompli entre 21 heures et 6 heures. La convention collective peut prévoir une période de 9 heures consécutives incluant l''intervalle 24h-5h.', 'temps_travail'),
('L3122-8', 'Repos compensateur de nuit', 'Droits acquis pour le travail de nuit.', 'Les travailleurs de nuit bénéficient de contreparties sous forme de repos compensateur et, le cas échéant, de compensation salariale (majoration de nuit à 10% dans l''IDCC 1351).', 'temps_travail'),
('Art. 7.1', 'Temps de pause', '20 minutes de pause toutes les 6 heures.', 'Dès que le temps de travail quotidien atteint 6 heures, le salarié bénéficie d''un temps de pause d''une durée minimale de 20 minutes. Dans la sécurité, cette pause n''est souvent pas payée sauf si l''agent reste à disposition de l''employeur.', 'temps_travail'),

-- CNAPS
('L612-20', 'Carte professionnelle obligatoire', 'Interdiction d''exercer sans carte pro.', 'Nul ne peut être employé pour participer à une activité de sécurité privée s''il n''est titulaire de la carte professionnelle dématérialisée délivrée par le CNAPS.', 'cnaps'),
('R612-5', 'Renouvellement carte CNAPS', 'Délais pour le renouvellement.', 'La demande de renouvellement de la carte professionnelle doit être adressée au CNAPS au moins 3 mois avant sa date d''expiration, accompagnée de l''attestation de MAC (Maintien et Actualisation des Compétences).', 'cnaps'),
('L611-1', 'Monopole et incompatibilité', 'Limites d''exercice de la sécurité privée.', 'L''activité de surveillance et de gardiennage ne peut s''exercer qu''à l''intérieur des bâtiments ou dans la limite des lieux dont l''employeur a la garde. Le gardiennage sur la voie publique est interdit.', 'cnaps'),
('R612-11', 'Port apparent de la carte', 'L''agent doit toujours avoir sa carte.', 'Dans l''exercice de ses fonctions, l''agent de sécurité privée doit obligatoirement détenir sa carte professionnelle ou le numéro de celle-ci, et être en mesure de la présenter à tout contrôle.', 'cnaps'),
('R613-1', 'Tenue de travail', 'Obligation du port de l''uniforme.', 'Les agents de sécurité doivent être vêtus d''une tenue spécifique comportant au moins deux insignes représentatifs de l''entreprise, empêchant toute confusion avec les forces de l''ordre.', 'cnaps'),
('Code Déo.', 'Respect du Code de Déontologie', 'Les agents doivent s''y conformer.', 'Le Livre VI du CSI impose un code de déontologie. Son non-respect expose l''agent et son entreprise à des sanctions disciplinaires par la commission d''agrément du CNAPS (blâme, interdiction d''exercer).', 'cnaps'),

-- Salaire
('L3231-2', 'SMIC et salaires', 'Principe de respect du salaire minimum.', 'Aucun salaire dans la sécurité privée ne peut être inférieur au SMIC, ni au salaire minimum conventionnel (SMC) prévu par la grille IDCC 1351 pour le coefficient de l''agent.', 'salaire'),
('Art. 9.1', 'Majoration dimanche et jours fériés', 'Paiement majoré pour travail dominical.', 'Les heures de travail effectuées un dimanche ou un jour férié donnent lieu à une majoration de salaire de 10% minimum selon l''accord de branche (hors 1er mai qui est majoré à 100%).', 'salaire'),
('L3121-28', 'Heures supplémentaires (Majoration)', 'Taux de majoration des HS.', 'Sauf accord d''entreprise prévoyant un taux différent (au minimum 10%), les 8 premières heures supplémentaires sont majorées à 25%, les suivantes à 50%.', 'salaire'),
('Art. 9.3', 'Frais de transport', 'Prise en charge de 50% du pass navigo.', 'L''employeur a l''obligation de prendre en charge 50% du prix des titres d''abonnements souscrits par ses salariés pour l''intégralité du trajet entre leur résidence habituelle et leur lieu de travail.', 'salaire'),
('Art. 9.4', 'Acompte sur salaire', 'Règles pour demander un acompte.', 'Le salarié peut demander, en cours de mois, le versement d''un acompte correspondant à la moitié de sa rémunération mensuelle nette pour le travail déjà accompli.', 'salaire'),
('Art. 10.2', 'Prime de chien (Maître-chien)', 'Indemnité pour l''amortissement du chien.', 'L''agent cynophile (coefficient 140) perçoit une indemnité forfaitaire pour l''amortissement, l''entretien et la nourriture de son chien, calculée par heure de vacation avec l''animal.', 'salaire'),

-- Disciplinaire
('L1331-1', 'Sanction disciplinaire', 'Définition d''une sanction.', 'Constitue une sanction toute mesure, autre que les observations verbales, prise par l''employeur à la suite d''un agissement du salarié considéré par lui comme fautif (avertissement, mise à pied, licenciement).', 'disciplinaire'),
('L1332-2', 'Procédure disciplinaire', 'Délais et convocation.', 'Aucune sanction ne peut être infligée au salarié sans que celui-ci soit informé par écrit des griefs retenus contre lui. Si la sanction est lourde, un entretien préalable est obligatoire.', 'disciplinaire'),
('L1332-4', 'Prescription des fautes', 'Délai de 2 mois.', 'Aucun fait fautif ne peut donner lieu à lui seul à l''engagement de poursuites disciplinaires au-delà d''un délai de deux mois à compter du jour où l''employeur en a eu connaissance.', 'disciplinaire'),
('Art. 12', 'Fautes graves en sécurité privée', 'Cas typiques de licenciement.', 'Dans le secteur de la sécurité, l''abandon de poste, le vol sur site, l''endormissement pendant une vacation ou la perte de l''agrément CNAPS sont systématiquement considérés comme des fautes graves justifiant le licenciement immédiat.', 'disciplinaire'),
('L1234-1', 'Préavis de licenciement', 'Durée du préavis.', 'Sauf faute grave ou lourde, l''agent licencié a droit à un préavis : 1 mois pour une ancienneté comprise entre 6 mois et 2 ans, et 2 mois pour une ancienneté supérieure à 2 ans.', 'disciplinaire'),
('L1321-1', 'Règlement intérieur', 'Obligation de respecter le règlement.', 'Le règlement intérieur fixe les règles de santé, de sécurité et la nature des sanctions. Il est obligatoire dans les entreprises d''au moins 50 salariés et s''impose à tous les agents.', 'disciplinaire'),

-- Congés
('L3141-3', 'Droits aux congés payés', 'Acquisition des jours de congés.', 'Le salarié a droit à 2,5 jours ouvrables de congés payés par mois de travail effectif chez le même employeur, soit 30 jours (5 semaines) par an au total.', 'conges'),
('L3141-13', 'Période de prise des congés', 'Quand prendre ses congés.', 'La période de prise des congés payés comprend dans tous les cas la période du 1er mai au 31 octobre de chaque année. L''employeur fixe l''ordre des départs.', 'conges'),
('L3141-16', 'Fixation de l''ordre des départs', 'L''employeur décide.', 'L''ordre des départs est fixé par l''employeur après avis du CSE, en tenant compte de la situation de famille de l''agent, de son ancienneté et de ses éventuelles activités chez d''autres employeurs.', 'conges'),
('L3142-1', 'Congés pour événements familiaux', 'Jours exceptionnels.', 'Le salarié a droit, sur justification, à des congés exceptionnels : 4 jours pour son mariage, 3 jours pour une naissance, 5 jours pour le décès d''un enfant, 3 jours pour le décès du conjoint.', 'conges'),
('Art. 8.4', 'Indemnité de congés payés', 'Règle du dixième ou maintien.', 'L''indemnité de congés payés est calculée selon la méthode la plus favorable entre la règle du 1/10ème de la rémunération brute annuelle et le maintien du salaire que l''agent aurait perçu s''il avait travaillé.', 'conges'),
('L1225-16', 'Congé maternité', 'Protection des agentes.', 'La salariée bénéficie d''un congé maternité d''une durée minimale de 16 semaines (6 semaines avant l''accouchement et 10 semaines après), pendant lesquelles son contrat de travail est suspendu.', 'conges'),
('L1225-35', 'Congé de paternité', 'Durée et droits.', 'Après la naissance d''un enfant, le père salarié a droit à un congé de paternité et d''accueil de l''enfant de 25 jours calendaires, dont 4 jours obligatoires consécutifs au congé de naissance de 3 jours.', 'conges'),
('L3142-16', 'Congé proche aidant', 'Aider un membre de la famille.', 'L''agent a droit à un congé pour s''occuper d''un membre de sa famille souffrant d''un handicap ou d''une perte d''autonomie grave. Sa durée est fixée par accord ou à défaut à 3 mois renouvelables.', 'conges');
