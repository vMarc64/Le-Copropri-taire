-- ============================================================================
-- SCRIPT DE GÉNÉRATION DE DONNÉES DE TEST
-- ============================================================================
-- Remplace 'TENANT_ID_HERE' par l'ID de ton syndic
-- Exécute ce script dans Supabase SQL Editor
-- ============================================================================

-- Variable pour le tenant (syndic)
-- Récupère le premier tenant ou remplace par l'ID souhaité
DO $$
DECLARE
  v_tenant_id UUID := 'f2270fc1-1c1a-477d-adbd-baa971bd9733'; -- Syndic Test Copilot
  v_condo_id UUID;
  v_owner_id UUID;
  v_lot_id UUID;
  v_meter_id UUID;
  v_bill_id UUID;
  v_condo_name TEXT;
  v_owner_first TEXT;
  v_owner_last TEXT;
  v_lot_ref TEXT;
  v_lot_type TEXT;
  v_meter_type TEXT;
  v_condo_count INT := 5;
  v_owners_per_condo INT;
  v_lots_per_owner INT;
  i INT;
  j INT;
  k INT;
  m INT;
  v_index_start DECIMAL;
  v_index_end DECIMAL;
  v_consumption DECIMAL;
BEGIN
  RAISE NOTICE 'Utilisation du tenant: %', v_tenant_id;

  -- ============================================================================
  -- CRÉATION DES COPROPRIÉTÉS
  -- ============================================================================
  
  FOR i IN 1..v_condo_count LOOP
    v_condo_name := CASE i
      WHEN 1 THEN 'Résidence Les Jardins du Parc'
      WHEN 2 THEN 'Le Clos des Lilas'
      WHEN 3 THEN 'Domaine de la Fontaine'
      WHEN 4 THEN 'Les Terrasses du Soleil'
      WHEN 5 THEN 'Villa Montmartre'
    END;

    INSERT INTO condominiums (
      id, tenant_id, name, address, postal_code, city, 
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_condo_name,
      (10 + i * 5)::TEXT || ' Rue de la République',
      '75' || LPAD((i * 3)::TEXT, 3, '0'),
      CASE i % 3 
        WHEN 0 THEN 'Paris'
        WHEN 1 THEN 'Lyon'
        ELSE 'Marseille'
      END,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_condo_id;

    RAISE NOTICE 'Créé copropriété: % (id: %)', v_condo_name, v_condo_id;

    -- Nombre aléatoire de propriétaires (10 à 20)
    v_owners_per_condo := 10 + (random() * 10)::INT;

    -- ============================================================================
    -- CRÉATION DES PROPRIÉTAIRES POUR CETTE COPRO
    -- ============================================================================
    
    FOR j IN 1..v_owners_per_condo LOOP
      v_owner_first := (ARRAY['Jean', 'Pierre', 'Marie', 'Sophie', 'Laurent', 'Isabelle', 'François', 'Catherine', 'Michel', 'Anne', 'Philippe', 'Nathalie', 'Alain', 'Christine', 'Bernard', 'Valérie', 'Patrick', 'Martine', 'Nicolas', 'Sandrine'])[1 + (random() * 19)::INT];
      v_owner_last := (ARRAY['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'])[1 + (random() * 19)::INT];

      -- Créer le user owner
      INSERT INTO users (
        id, tenant_id, email, password_hash, first_name, last_name,
        role, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        LOWER(v_owner_first || '.' || v_owner_last || '.' || i || '.' || j || '@test.lecopro.fr'),
        '$2b$10$dummyhashnotusedfortesting12345678901234567890',
        v_owner_first,
        v_owner_last,
        'owner',
        'active',
        NOW(),
        NOW()
      )
      RETURNING id INTO v_owner_id;

      -- Associer à la copropriété
      INSERT INTO owner_condominiums (
        id, tenant_id, owner_id, condominium_id, created_at
      ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_owner_id,
        v_condo_id,
        NOW()
      );

      -- Nombre de lots pour ce propriétaire (1 à 3)
      v_lots_per_owner := 1 + (random() * 2)::INT;

      -- ============================================================================
      -- CRÉATION DES LOTS POUR CE PROPRIÉTAIRE
      -- ============================================================================
      
      FOR k IN 1..v_lots_per_owner LOOP
        v_lot_type := (ARRAY['apartment', 'parking', 'cellar', 'garage', 'commercial'])[1 + (random() * 4)::INT];
        v_lot_ref := UPPER(CHR(64 + i)) || LPAD((j * 10 + k)::TEXT, 3, '0');

        INSERT INTO lots (
          id, tenant_id, condominium_id, owner_id, reference, type,
          floor, surface, tantiemes, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          v_tenant_id,
          v_condo_id,
          v_owner_id,
          v_lot_ref,
          v_lot_type,
          CASE v_lot_type 
            WHEN 'parking' THEN -1
            WHEN 'cellar' THEN -2
            ELSE (random() * 6)::INT
          END,
          CASE v_lot_type
            WHEN 'apartment' THEN 40 + (random() * 80)::DECIMAL
            WHEN 'parking' THEN 12
            WHEN 'cellar' THEN 8
            WHEN 'garage' THEN 15
            WHEN 'commercial' THEN 50 + (random() * 100)::DECIMAL
          END,
          CASE v_lot_type
            WHEN 'apartment' THEN 100 + (random() * 400)::INT
            WHEN 'parking' THEN 10 + (random() * 20)::INT
            WHEN 'cellar' THEN 5 + (random() * 10)::INT
            WHEN 'garage' THEN 15 + (random() * 20)::INT
            WHEN 'commercial' THEN 200 + (random() * 300)::INT
          END,
          NOW(),
          NOW()
        )
        RETURNING id INTO v_lot_id;

        -- ============================================================================
        -- CRÉATION DES COMPTEURS POUR CE LOT (seulement pour apartments)
        -- ============================================================================
        
        IF v_lot_type = 'apartment' THEN
          -- Compteurs à créer pour les appartements
          FOREACH v_meter_type IN ARRAY ARRAY['cold_water', 'hot_water', 'heating'] LOOP
            v_index_start := 1000 + (random() * 5000)::DECIMAL;
            
            INSERT INTO lot_meters (
              id, tenant_id, lot_id, meter_type, meter_number,
              is_dual_tariff, is_active, last_reading_date, last_reading_value,
              created_at, updated_at
            ) VALUES (
              gen_random_uuid(),
              v_tenant_id,
              v_lot_id,
              v_meter_type,
              'CPT-' || UPPER(SUBSTRING(v_meter_type, 1, 2)) || '-' || LPAD((random() * 99999)::INT::TEXT, 5, '0'),
              FALSE,
              TRUE,
              CURRENT_DATE - INTERVAL '30 days',
              v_index_start,
              NOW(),
              NOW()
            );
          END LOOP;
        END IF;
      END LOOP;
    END LOOP;

    -- ============================================================================
    -- CRÉATION DES FACTURES DE CHARGES POUR CETTE COPRO
    -- ============================================================================
    
    -- Facture Eau Froide - Dernier trimestre
    INSERT INTO utility_bills (
      id, tenant_id, condominium_id, utility_type,
      period_start, period_end, 
      global_index_start, global_index_end,
      total_consumption, unit, total_amount,
      invoice_number, invoice_date, supplier_name, status,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_condo_id,
      'cold_water',
      CURRENT_DATE - INTERVAL '3 months',
      CURRENT_DATE,
      10000 + (random() * 1000)::INT,
      10500 + (random() * 1000)::INT,
      400 + (random() * 200)::DECIMAL,
      'm3',
      800 + (random() * 400)::DECIMAL,
      'EF-2024-' || LPAD(i::TEXT, 3, '0'),
      CURRENT_DATE - INTERVAL '5 days',
      'Veolia Eau',
      'draft',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_bill_id;

    -- Créer les relevés pour chaque compteur d'eau froide
    INSERT INTO meter_readings (
      id, tenant_id, utility_bill_id, lot_meter_id,
      previous_index, current_index, consumption, allocated_amount,
      created_at, updated_at
    )
    SELECT 
      gen_random_uuid(),
      v_tenant_id,
      v_bill_id,
      lm.id,
      COALESCE(lm.last_reading_value, 1000),
      COALESCE(lm.last_reading_value, 1000) + (10 + (random() * 50)::DECIMAL),
      10 + (random() * 50)::DECIMAL,
      (10 + (random() * 50)::DECIMAL) * 2.5,
      NOW(),
      NOW()
    FROM lot_meters lm
    INNER JOIN lots l ON lm.lot_id = l.id
    WHERE l.condominium_id = v_condo_id
    AND lm.meter_type = 'cold_water';

    -- Facture Eau Chaude
    INSERT INTO utility_bills (
      id, tenant_id, condominium_id, utility_type,
      period_start, period_end,
      global_index_start, global_index_end,
      total_consumption, unit, total_amount,
      invoice_number, invoice_date, supplier_name, status,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_condo_id,
      'hot_water',
      CURRENT_DATE - INTERVAL '3 months',
      CURRENT_DATE,
      5000 + (random() * 500)::INT,
      5200 + (random() * 500)::INT,
      150 + (random() * 100)::DECIMAL,
      'm3',
      600 + (random() * 300)::DECIMAL,
      'EC-2024-' || LPAD(i::TEXT, 3, '0'),
      CURRENT_DATE - INTERVAL '5 days',
      'Engie',
      'draft',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_bill_id;

    INSERT INTO meter_readings (
      id, tenant_id, utility_bill_id, lot_meter_id,
      previous_index, current_index, consumption, allocated_amount,
      created_at, updated_at
    )
    SELECT 
      gen_random_uuid(),
      v_tenant_id,
      v_bill_id,
      lm.id,
      COALESCE(lm.last_reading_value, 500),
      COALESCE(lm.last_reading_value, 500) + (5 + (random() * 25)::DECIMAL),
      5 + (random() * 25)::DECIMAL,
      (5 + (random() * 25)::DECIMAL) * 4.5,
      NOW(),
      NOW()
    FROM lot_meters lm
    INNER JOIN lots l ON lm.lot_id = l.id
    WHERE l.condominium_id = v_condo_id
    AND lm.meter_type = 'hot_water';

    -- Facture Chauffage
    INSERT INTO utility_bills (
      id, tenant_id, condominium_id, utility_type,
      period_start, period_end,
      total_consumption, unit, total_amount,
      invoice_number, invoice_date, supplier_name, status,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_condo_id,
      'heating',
      CURRENT_DATE - INTERVAL '4 months',
      CURRENT_DATE - INTERVAL '1 month',
      8000 + (random() * 4000)::DECIMAL,
      'kwh',
      2500 + (random() * 1500)::DECIMAL,
      'CH-2024-' || LPAD(i::TEXT, 3, '0'),
      CURRENT_DATE - INTERVAL '10 days',
      'EDF',
      'validated',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_bill_id;

    INSERT INTO meter_readings (
      id, tenant_id, utility_bill_id, lot_meter_id,
      previous_index, current_index, consumption, allocated_amount,
      created_at, updated_at
    )
    SELECT 
      gen_random_uuid(),
      v_tenant_id,
      v_bill_id,
      lm.id,
      COALESCE(lm.last_reading_value, 2000),
      COALESCE(lm.last_reading_value, 2000) + (100 + (random() * 400)::DECIMAL),
      100 + (random() * 400)::DECIMAL,
      (100 + (random() * 400)::DECIMAL) * 0.18,
      NOW(),
      NOW()
    FROM lot_meters lm
    INNER JOIN lots l ON lm.lot_id = l.id
    WHERE l.condominium_id = v_condo_id
    AND lm.meter_type = 'heating';

    RAISE NOTICE 'Copro % terminée avec % propriétaires', v_condo_name, v_owners_per_condo;
  END LOOP;

  -- ============================================================================
  -- RÉSUMÉ
  -- ============================================================================
  RAISE NOTICE '============================================';
  RAISE NOTICE 'GÉNÉRATION TERMINÉE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Copropriétés créées: %', (SELECT COUNT(*) FROM condominiums WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Propriétaires créés: %', (SELECT COUNT(*) FROM users WHERE tenant_id = v_tenant_id AND role = 'owner');
  RAISE NOTICE 'Lots créés: %', (SELECT COUNT(*) FROM lots WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Compteurs créés: %', (SELECT COUNT(*) FROM lot_meters WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Factures créées: %', (SELECT COUNT(*) FROM utility_bills WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Relevés créés: %', (SELECT COUNT(*) FROM meter_readings WHERE tenant_id = v_tenant_id);
  
END $$;
