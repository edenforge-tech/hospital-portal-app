-- Seed Diagnostic procedures (run after constraint fix)
DO $$
DECLARE v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenant WHERE deleted_at IS NULL LIMIT 1;
  PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
  RAISE NOTICE 'Tenant: %', v_tenant_id;
END $$;

INSERT INTO surgery_types (tenant_id,surgery_name,surgery_code,surgery_category,procedure_type,requires_iol,default_price,unit_of_measure,typical_duration_minutes,requires_admission,anesthesia_type,estimated_cost_min,estimated_cost_max,display_order,is_active,created_at,updated_at) VALUES
(current_setting('app.seed_tenant_id')::UUID,'A-Scan Biometry','DIAG-ASCAN','Diagnostic','Diagnostic',FALSE,1500,'Per Eye',10,FALSE,'None',1500,1500,801,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'B-Scan Ultrasonography','DIAG-BSCAN','Diagnostic','Diagnostic',FALSE,1000,'Per Eye',10,FALSE,'None',1000,1000,802,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'Fundus Photography','DIAG-FUNDUS','Diagnostic','Diagnostic',FALSE,500,'Per Eye',5,FALSE,'None',500,500,803,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'OCT (Optical Coherence Tomography)','DIAG-OCT','Diagnostic','Diagnostic',FALSE,1500,'Per Eye',10,FALSE,'None',1500,1500,804,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'OCT Macula','DIAG-OCT-MACULA','Diagnostic','Diagnostic',FALSE,1500,'Per Eye',10,FALSE,'None',1500,1500,805,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'CCT (Central Corneal Thickness)','DIAG-CCT','Diagnostic','Diagnostic',FALSE,500,'Per Eye',5,FALSE,'None',500,500,806,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'OCT RNFL','DIAG-OCT-RNFL','Diagnostic','Diagnostic',FALSE,1500,'Per Eye',10,FALSE,'None',1500,1500,807,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'AS-OCT (Anterior Segment OCT)','DIAG-AS-OCT','Diagnostic','Diagnostic',FALSE,1500,'Per Eye',10,FALSE,'None',1500,1500,808,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'HVF Fields (Humphrey Visual Field)','DIAG-HVF','Diagnostic','Diagnostic',FALSE,1000,'Per Eye',20,FALSE,'None',1000,1000,809,TRUE,NOW(),NOW()),
(current_setting('app.seed_tenant_id')::UUID,'Surgical Profile','DIAG-SURGICAL-PROFILE','Diagnostic','Diagnostic',FALSE,1950,'Per Visit',15,FALSE,'None',1950,1950,810,TRUE,NOW(),NOW())
ON CONFLICT (tenant_id,surgery_code) DO UPDATE SET surgery_name=EXCLUDED.surgery_name,default_price=EXCLUDED.default_price,updated_at=NOW();

-- Final count per category
SELECT surgery_category, COUNT(*) AS count
FROM surgery_types
WHERE deleted_at IS NULL AND is_active=TRUE
GROUP BY surgery_category ORDER BY surgery_category;
