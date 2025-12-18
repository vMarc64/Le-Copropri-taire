-- =============================================================================
-- Seed script for tenant "Les Avengers"
-- Tenant ID: 2a7d5a2f-6ac1-4968-b5e8-585e502fb879
-- 
-- RÈGLES MÉTIER :
-- - Eau froide    : global_metered | individual (2 options)
-- - Eau chaude    : global_metered | none (2 options)
-- - Chauffage     : global_tantiemes | none (2 options)
-- - Gaz           : global_metered | individual | none (3 options)
-- - Élec communes : global_tantiemes (toujours)
--
-- 12 copropriétés pour couvrir toutes les combinaisons pertinentes
-- =============================================================================

-- 1) Créer 12 copropriétés avec TOUTES les combinaisons possibles
INSERT INTO condominiums (id, tenant_id, name, address, city, postal_code, call_frequency, cold_water_billing, hot_water_billing, heating_billing, gas_billing, electricity_common_billing, bank_iban, bank_name, created_at)
VALUES
  -- ============ EAU FROIDE = global_metered ============
  
  -- 1. Eau metered + Eau chaude metered + Chauffage none + Gaz none
  -- (Immeuble moderne tout électrique, compteurs eau)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'La Tour Stark', '1 Avenue des Héros', 'Paris', '75001', 'quarterly', 
   'global_metered', 'global_metered', 'none', 'none', 'global_tantiemes', 
   'FR7612345987650123456789001', 'Banque Stark', now()),
  
  -- 2. Eau metered + Eau chaude metered + Chauffage tantièmes + Gaz none
  -- (Immeuble avec chauffage collectif électrique)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Résidence Asgard', '42 Rue du Bifrost', 'Paris', '75008', 'quarterly', 
   'global_metered', 'global_metered', 'global_tantiemes', 'none', 'global_tantiemes', 
   'FR7612345987650123456789002', 'Banque Nordique', now()),
  
  -- 3. Eau metered + Eau chaude metered + Chauffage none + Gaz metered
  -- (Immeuble avec gaz collectif pour cuisine)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Le Wakanda', '7 Boulevard Vibranium', 'Paris', '75016', 'quarterly', 
   'global_metered', 'global_metered', 'none', 'global_metered', 'global_tantiemes', 
   'FR7612345987650123456789003', 'Banque Africaine', now()),
  
  -- 4. Eau metered + Eau chaude metered + Chauffage tantièmes + Gaz metered
  -- (Immeuble complet : eau + chauffage + gaz collectifs)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Shield Tower', '99 Avenue Nick Fury', 'Paris', '75007', 'quarterly', 
   'global_metered', 'global_metered', 'global_tantiemes', 'global_metered', 'global_tantiemes', 
   'FR7612345987650123456789004', 'Banque Fédérale', now()),
  
  -- 5. Eau metered + Eau chaude metered + Chauffage none + Gaz individual
  -- (Gaz en contrat direct par lot)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Les Jardins de Xavier', '1407 Graymalkin Lane', 'Paris', '75005', 'quarterly', 
   'global_metered', 'global_metered', 'none', 'individual', 'global_tantiemes', 
   'FR7612345987650123456789005', 'Banque Mutante', now()),
  
  -- 6. Eau metered + Eau chaude metered + Chauffage tantièmes + Gaz individual
  -- (Chauffage collectif mais gaz cuisine individuel)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Avengers Compound', '1 Upstate Road', 'Paris', '75012', 'quarterly', 
   'global_metered', 'global_metered', 'global_tantiemes', 'individual', 'global_tantiemes', 
   'FR7612345987650123456789006', 'Banque Compound', now()),
  
  -- 7. Eau metered + Eau chaude none + Chauffage none + Gaz none
  -- (Petit immeuble basique, eau froide seulement)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Sanctum Sanctorum', '177A Bleecker Street', 'Paris', '75006', 'quarterly', 
   'global_metered', 'none', 'none', 'none', 'global_tantiemes', 
   'FR7612345987650123456789007', 'Banque Mystique', now()),
  
  -- 8. Eau metered + Eau chaude none + Chauffage tantièmes + Gaz none
  -- (Eau froide + chauffage collectif, pas d'eau chaude collective)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Knowhere Station', '42 Celestial Road', 'Paris', '75019', 'quarterly', 
   'global_metered', 'none', 'global_tantiemes', 'none', 'global_tantiemes', 
   'FR7612345987650123456789008', 'Banque Céleste', now()),
  
  -- ============ EAU FROIDE = individual ============
  
  -- 9. Eau individual + Eau chaude none + Chauffage none + Gaz none
  -- (Tout individuel, juste élec communes)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Résidence Thanos', '1 Titan Avenue', 'Paris', '75013', 'quarterly', 
   'individual', 'none', 'none', 'none', 'global_tantiemes', 
   'FR7612345987650123456789009', 'Banque Titan', now()),
  
  -- 10. Eau individual + Eau chaude none + Chauffage tantièmes + Gaz none
  -- (Eau individuelle mais chauffage collectif)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Tour des Gardiens', '1 Galaxy Way', 'Paris', '75014', 'quarterly', 
   'individual', 'none', 'global_tantiemes', 'none', 'global_tantiemes', 
   'FR7612345987650123456789010', 'Banque Galactique', now()),
  
  -- 11. Eau individual + Eau chaude none + Chauffage none + Gaz metered
  -- (Eau individuelle, gaz collectif pour chauffage)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Baxter Building', '42 Madison Avenue', 'Paris', '75015', 'quarterly', 
   'individual', 'none', 'none', 'global_metered', 'global_tantiemes', 
   'FR7612345987650123456789011', 'Banque Fantastique', now()),
  
  -- 12. Eau individual + Eau chaude none + Chauffage tantièmes + Gaz metered
  -- (Eau individuelle, chauffage tantièmes, gaz collectif)
  (gen_random_uuid(), '2a7d5a2f-6ac1-4968-b5e8-585e502fb879', 
   'Oscorp Tower', '1 Norman Way', 'Paris', '75017', 'quarterly', 
   'individual', 'none', 'global_tantiemes', 'global_metered', 'global_tantiemes', 
   'FR7612345987650123456789012', 'Banque Oscorp', now());

-- 2) Créer des comptes bancaires pour chaque copropriété
INSERT INTO bank_accounts (id, tenant_id, condominium_id, bank_name, account_name, iban, balance, currency, created_at)
SELECT 
  gen_random_uuid(),
  '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
  c.id,
  c.bank_name,
  c.name || ' - Compte principal',
  c.bank_iban,
  (50000 + floor(random() * 100000))::numeric(12,2),
  'EUR',
  now()
FROM condominiums c
WHERE c.tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879'
  AND NOT EXISTS (SELECT 1 FROM bank_accounts ba WHERE ba.condominium_id = c.id);

-- 3) Créer 500 propriétaires
DO $$
DECLARE
  first_names TEXT[] := ARRAY['Tony','Steve','Thor','Natasha','Bruce','Clint','Wanda','Peter','Stephen','Tchalla','Nick','James','Pepper','Maria','Bucky','Sam','Scott','Hope','Carol','Gamora','Drax','Groot','Rocket','Quill','Loki','Jane','Valkyrie','Shuri','Okoye','Vision','Wade','Logan','Charles','Erik','Raven','Ororo','Jean','Hank','Bobby','Warren','Kurt','Remy','Anna','Jubilee','Kitty','Emma','Scott S','Alex','Sean','Darwin','Angel','Moira','Henry','Reed','Susan','Ben','Johnny','Victor','Pietro','Crystal','Medusa','Gorgon','Karnak','Triton','Lockjaw','Matt','Jessica','Luke','Danny','Frank','Elektra','Claire','Colleen','Misty','Karen','Foggy','Wilson','Kingpin','Vanessa','Maya','Echo','Marc','Steven','Jake','Layla','Khonshu'];
  last_names TEXT[] := ARRAY['Stark','Rogers','Odinson','Romanoff','Banner','Barton','Maximoff','Parker','Strange','Tchalla','Fury','Rhodes','Potts','Hill','Barnes','Wilson','Lang','VanDyne','Danvers','Titanos','Destroyer','Flora','Raccoon','Starlord','Laufeyson','Foster','Brunhilde','Udaku','Milaje','Shade','Wilson','Howlett','Xavier','Lehnsherr','Darkholme','Munroe','Grey','McCoy','Drake','Worthington','Wagner','LeBeau','Marie','Lee','Pryde','Frost','Summers','Summers','Cassidy','Munoz','Salvadore','MacTaggert','Pym','Richards','Storm','Grimm','Storm','Von Doom','Maximoff','Amaquelin','Boltagon','Petragon','Priest','Triton','Lockjaw','Murdock','Jones','Cage','Rand','Castle','Natchios','Temple','Wing','Knight','Page','Nelson','Fisk','Fisk','Lopez','Lopez','Spector','Grant','Lockley','El-Faouly','Moon'];
  i INT;
  fname TEXT;
  lname TEXT;
  email TEXT;
BEGIN
  FOR i IN 1..500 LOOP
    fname := first_names[1 + floor(random() * array_length(first_names, 1))::int];
    lname := last_names[1 + floor(random() * array_length(last_names, 1))::int];
    email := lower(fname) || '.' || lower(lname) || '.' || i || '@avengers.test';
    
    INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, status, created_at)
    VALUES (
      gen_random_uuid(),
      '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
      email,
      '$2b$10$dummyhashforseeding',
      fname,
      lname,
      'owner',
      'active',
      now()
    );
  END LOOP;
END $$;

-- 4) Créer les lots avec tantièmes RÉALISTES
DO $$
DECLARE
  condo RECORD;
  owner_ids UUID[];
  apt_count INT;
  park_count INT;
  j INT;
  selected_owner UUID;
  lot_surface NUMERIC;
  lot_tantiemes NUMERIC;
  lot_type_name TEXT;
  apt_types TEXT[] := ARRAY['T1','T2','T2','T3','T3','T3','T4','T4','T5'];
BEGIN
  SELECT array_agg(id) INTO owner_ids 
  FROM users 
  WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879' AND role = 'owner';

  FOR condo IN SELECT * FROM condominiums WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879' LOOP
    -- Nombre de lots variable selon la copro (pour diversité)
    CASE 
      WHEN condo.name LIKE '%Stark%' THEN apt_count := 40; park_count := 30;
      WHEN condo.name LIKE '%Asgard%' THEN apt_count := 25; park_count := 20;
      WHEN condo.name LIKE '%Wakanda%' THEN apt_count := 50; park_count := 35;
      WHEN condo.name LIKE '%Shield%' THEN apt_count := 35; park_count := 40;
      WHEN condo.name LIKE '%Xavier%' THEN apt_count := 20; park_count := 15;
      WHEN condo.name LIKE '%Compound%' THEN apt_count := 30; park_count := 25;
      WHEN condo.name LIKE '%Sanctum%' THEN apt_count := 10; park_count := 5;
      WHEN condo.name LIKE '%Knowhere%' THEN apt_count := 15; park_count := 10;
      WHEN condo.name LIKE '%Thanos%' THEN apt_count := 12; park_count := 8;
      WHEN condo.name LIKE '%Gardiens%' THEN apt_count := 18; park_count := 12;
      WHEN condo.name LIKE '%Baxter%' THEN apt_count := 22; park_count := 18;
      WHEN condo.name LIKE '%Oscorp%' THEN apt_count := 28; park_count := 22;
      ELSE apt_count := 15; park_count := 10;
    END CASE;

    -- Créer les appartements
    FOR j IN 1..apt_count LOOP
      selected_owner := owner_ids[1 + floor(random() * array_length(owner_ids, 1))::int];
      lot_type_name := apt_types[1 + floor(random() * array_length(apt_types, 1))::int];
      
      CASE lot_type_name
        WHEN 'T1' THEN 
          lot_surface := (20 + floor(random() * 15))::numeric;
          lot_tantiemes := (50 + floor(random() * 20))::numeric;
        WHEN 'T2' THEN 
          lot_surface := (35 + floor(random() * 20))::numeric;
          lot_tantiemes := (70 + floor(random() * 25))::numeric;
        WHEN 'T3' THEN 
          lot_surface := (55 + floor(random() * 25))::numeric;
          lot_tantiemes := (85 + floor(random() * 30))::numeric;
        WHEN 'T4' THEN 
          lot_surface := (80 + floor(random() * 30))::numeric;
          lot_tantiemes := (100 + floor(random() * 35))::numeric;
        WHEN 'T5' THEN 
          lot_surface := (100 + floor(random() * 40))::numeric;
          lot_tantiemes := (120 + floor(random() * 40))::numeric;
        ELSE
          lot_surface := (50 + floor(random() * 30))::numeric;
          lot_tantiemes := (80 + floor(random() * 30))::numeric;
      END CASE;
      
      INSERT INTO lots (id, tenant_id, condominium_id, reference, type, floor, surface, tantiemes, owner_id, created_at)
      VALUES (
        gen_random_uuid(),
        '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
        condo.id,
        'A' || lpad(j::text, 3, '0'),
        'appartement',
        1 + (j % 6),
        lot_surface,
        lot_tantiemes,
        selected_owner,
        now()
      );
    END LOOP;

    -- Créer les parkings
    FOR j IN 1..park_count LOOP
      selected_owner := owner_ids[1 + floor(random() * array_length(owner_ids, 1))::int];
      lot_surface := (12 + floor(random() * 6))::numeric;
      lot_tantiemes := (2 + floor(random() * 9))::numeric;
      
      INSERT INTO lots (id, tenant_id, condominium_id, reference, type, floor, surface, tantiemes, owner_id, created_at)
      VALUES (
        gen_random_uuid(),
        '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
        condo.id,
        'P' || lpad(j::text, 3, '0'),
        'parking',
        -1,
        lot_surface,
        lot_tantiemes,
        selected_owner,
        now()
      );
    END LOOP;
  END LOOP;
END $$;

-- 5) Créer les sous-compteurs UNIQUEMENT pour global_metered
DO $$
DECLARE
  lot RECORD;
BEGIN
  FOR lot IN 
    SELECT l.id as lot_id, l.reference, l.type as lot_type,
           c.cold_water_billing, c.hot_water_billing, c.gas_billing
    FROM lots l
    JOIN condominiums c ON c.id = l.condominium_id
    WHERE l.tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879'
  LOOP
    -- Compteur eau froide (seulement si global_metered)
    IF lot.cold_water_billing = 'global_metered' THEN
      INSERT INTO lot_meters (id, tenant_id, lot_id, meter_type, meter_number, is_active, last_reading_value, last_reading_date, created_at)
      VALUES (
        gen_random_uuid(),
        '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
        lot.lot_id,
        'cold_water',
        'CW-' || substring(md5(lot.lot_id::text) from 1 for 8),
        true,
        floor(random() * 500)::numeric,
        '2023-12-31'::date,
        now()
      );
    END IF;

    -- Compteur eau chaude (seulement si global_metered)
    IF lot.hot_water_billing = 'global_metered' THEN
      INSERT INTO lot_meters (id, tenant_id, lot_id, meter_type, meter_number, is_active, last_reading_value, last_reading_date, created_at)
      VALUES (
        gen_random_uuid(),
        '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
        lot.lot_id,
        'hot_water',
        'HW-' || substring(md5(lot.lot_id::text || 'hw') from 1 for 8),
        true,
        floor(random() * 300)::numeric,
        '2023-12-31'::date,
        now()
      );
    END IF;

    -- Compteur gaz (seulement si global_metered ET appartement)
    IF lot.gas_billing = 'global_metered' AND lot.lot_type = 'appartement' THEN
      INSERT INTO lot_meters (id, tenant_id, lot_id, meter_type, meter_number, is_active, last_reading_value, last_reading_date, created_at)
      VALUES (
        gen_random_uuid(),
        '2a7d5a2f-6ac1-4968-b5e8-585e502fb879',
        lot.lot_id,
        'gas',
        'GA-' || substring(md5(lot.lot_id::text || 'ga') from 1 for 8),
        true,
        floor(random() * 1000)::numeric,
        '2023-12-31'::date,
        now()
      );
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- VÉRIFICATION : Toutes les combinaisons
-- =============================================================================

-- Vue d'ensemble des combinaisons
SELECT 
  c.name as copropriete,
  c.cold_water_billing as eau_froide,
  c.hot_water_billing as eau_chaude,
  c.heating_billing as chauffage,
  c.gas_billing as gaz,
  c.electricity_common_billing as elec
FROM condominiums c
WHERE c.tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879'
ORDER BY c.cold_water_billing, c.hot_water_billing, c.heating_billing, c.gas_billing;

-- Totaux
SELECT 'Copropriétés' as entite, count(*) as total FROM condominiums WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879';
SELECT 'Propriétaires' as entite, count(*) as total FROM users WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879' AND role = 'owner';
SELECT 'Lots' as entite, count(*) as total FROM lots WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879';
SELECT 'Compteurs' as entite, count(*) as total FROM lot_meters WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879';

-- Détail par copro
SELECT 
  c.name as copropriete,
  count(DISTINCT l.id) as nb_lots,
  sum(l.tantiemes)::int as total_tantiemes,
  count(DISTINCT lm.id) as nb_compteurs
FROM condominiums c
LEFT JOIN lots l ON l.condominium_id = c.id
LEFT JOIN lot_meters lm ON lm.lot_id = l.id
WHERE c.tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879'
GROUP BY c.id, c.name
ORDER BY c.name;

-- Compteurs par type
SELECT meter_type, count(*) FROM lot_meters 
WHERE tenant_id = '2a7d5a2f-6ac1-4968-b5e8-585e502fb879'
GROUP BY meter_type;
