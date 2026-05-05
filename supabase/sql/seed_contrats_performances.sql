-- Supprimer les données précédentes si elles existent
DELETE FROM contrats;
DELETE FROM performances;

-- Générer 45 contrats pour les 50 agents (actifs)
INSERT INTO contrats (societe_id, agent_id, client_nom, type_mission, montant, date_debut, date_fin, status)
SELECT
  a.societe_id,
  a.id,
  CASE (RANDOM() * 10)::INT
    WHEN 0 THEN 'Carrefour Lyon Part-Dieu'
    WHEN 1 THEN 'Centre Commercial Confluence'
    WHEN 2 THEN 'Hôpital Edouard Herriot'
    WHEN 3 THEN 'Banque Crédit Agricole'
    WHEN 4 THEN 'Stade de Gerland'
    WHEN 5 THEN 'Musée des Confluences'
    WHEN 6 THEN 'Festival Nuits Sonores'
    WHEN 7 THEN 'Aéroport Lyon-Saint-Exupéry'
    WHEN 8 THEN 'Tour Incity'
    ELSE 'Parc de la Tête d''Or'
  END as client_nom,
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'Gardiennage'
    WHEN 1 THEN 'Surveillance événementielle'
    WHEN 2 THEN 'Maître-chien'
    WHEN 3 THEN 'Protection rapprochée'
    ELSE 'Vidéosurveillance'
  END as type_mission,
  (RANDOM() * 15000 + 3000)::DECIMAL(10,2) as montant,
  CURRENT_DATE - (RANDOM() * 180)::INT as date_debut,
  CURRENT_DATE + (RANDOM() * 180)::INT as date_fin,
  CASE WHEN RANDOM() < 0.85 THEN 'actif' ELSE 'termine' END as status
FROM agents a
WHERE a.statut = 'actif'
LIMIT 45;

-- Générer 6 mois de performances pour chaque agent
INSERT INTO performances (agent_id, mois, missions_effectuees, heures_travaillees, score, ponctualite, retards)
SELECT
  a.id,
  DATE_TRUNC('month', CURRENT_DATE - (n.num * INTERVAL '1 month'))::DATE as mois,
  (RANDOM() * 20 + 5)::INT as missions_effectuees,
  (RANDOM() * 50 + 120)::DECIMAL(5,2) as heures_travaillees,
  (RANDOM() * 25 + 70)::DECIMAL(5,2) as score,
  (RANDOM() * 20 + 80)::INT as ponctualite,
  (RANDOM() * 5)::INT as retards
FROM agents a
CROSS JOIN (
  SELECT generate_series(0, 5) as num
) n
WHERE a.statut = 'actif';
