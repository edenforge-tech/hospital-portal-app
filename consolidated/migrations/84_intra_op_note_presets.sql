-- ============================================================================
-- Migration 84: Intra-Operative Note Presets (Eye Surgery Dropdown Options)
-- Purpose: Database-driven multi-select options for OT intra-op notes per field
--          (procedure, findings, complications, anesthesia_notes)
-- Dependencies: tenant (01), intra_op_notes (83)
-- Date: 2026-04
-- ============================================================================

BEGIN;

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intra_op_note_presets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID REFERENCES tenant(id),      -- NULL = global system preset
    field_name       VARCHAR(50) NOT NULL              -- procedure|findings|complications|anesthesia_notes
                         CHECK (field_name IN ('procedure','findings','complications','anesthesia_notes')),
    option_label     VARCHAR(200) NOT NULL,
    display_order    INTEGER NOT NULL DEFAULT 0,
    is_system_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ,
    status           VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_ionp_field ON intra_op_note_presets(field_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ionp_tenant ON intra_op_note_presets(tenant_id) WHERE deleted_at IS NULL;

-- ── Seed: Procedure / Technique ───────────────────────────────────────────────

INSERT INTO intra_op_note_presets (field_name, option_label, display_order) VALUES
  ('procedure', 'Phacoemulsification',                              1),
  ('procedure', 'Phaco + In-the-Bag IOL Implantation',             2),
  ('procedure', 'Phaco + Sulcus IOL Implantation',                 3),
  ('procedure', 'Manual SICS (MSICS)',                             4),
  ('procedure', 'MSICS + IOL Implantation',                        5),
  ('procedure', 'ECCE (Extra-Capsular Cataract Extraction)',        6),
  ('procedure', 'FLACS (Femtosecond Laser-Assisted Cataract)',      7),
  ('procedure', 'Anterior Vitrectomy',                             8),
  ('procedure', 'Capsulorrhexis (CCC)',                            9),
  ('procedure', 'Trabeculectomy',                                  10),
  ('procedure', 'Combined Phaco + Trabeculectomy',                 11),
  ('procedure', 'Pars Plana Vitrectomy (PPV)',                     12),
  ('procedure', 'Scleral Buckle',                                  13),
  ('procedure', 'DSAEK / DMEK (Endothelial Keratoplasty)',         14),
  ('procedure', 'DALK (Deep Anterior Lamellar Keratoplasty)',      15),
  ('procedure', 'Penetrating Keratoplasty (PKP)',                  16),
  ('procedure', 'Pterygium Excision + Conjunctival Autograft',     17),
  ('procedure', 'DCR (Dacryocystorhinostomy)',                     18),
  ('procedure', 'Strabismus Correction / Muscle Surgery',          19),
  ('procedure', 'Intravitreal Injection',                          20),
  ('procedure', 'YAG Laser Capsulotomy (Intra-Op)',               21);

-- ── Seed: Intra-Op Findings ───────────────────────────────────────────────────

INSERT INTO intra_op_note_presets (field_name, option_label, display_order) VALUES
  ('findings', 'Normal Findings / Uneventful',                     1),
  ('findings', 'Good Red Reflex',                                  2),
  ('findings', 'Poor Red Reflex',                                  3),
  ('findings', 'Dense / Hard Nucleus (Grade 3–4)',                 4),
  ('findings', 'Soft Nucleus',                                     5),
  ('findings', 'White / Mature Cataract',                          6),
  ('findings', 'Posterior Polar Cataract',                         7),
  ('findings', 'Hypermature / Intumescent Cataract',               8),
  ('findings', 'Posterior Subcapsular Cataract',                   9),
  ('findings', 'Pseudoexfoliation (PXF)',                          10),
  ('findings', 'Phacodonesis / Lens Subluxation',                  11),
  ('findings', 'Small Pupil / Pupil Miosis',                       12),
  ('findings', 'Floppy Iris (IFIS)',                               13),
  ('findings', 'Zonular Weakness / Dialysis',                      14),
  ('findings', 'Posterior Capsule Plaque',                         15),
  ('findings', 'Shallow Anterior Chamber',                         16),
  ('findings', 'High Vitreous Pressure',                           17),
  ('findings', 'Corneal Haze / Edema',                             18),
  ('findings', 'Calcific Lens Deposits',                           19),
  ('findings', 'Coppery / Brunescent Nucleus',                     20);

-- ── Seed: Complications ───────────────────────────────────────────────────────

INSERT INTO intra_op_note_presets (field_name, option_label, display_order) VALUES
  ('complications', 'None – Uneventful',                           1),
  ('complications', 'Posterior Capsule Rupture (PCR)',             2),
  ('complications', 'Vitreous Loss',                               3),
  ('complications', 'Zonular Dialysis / Dehiscence',               4),
  ('complications', 'Anterior Capsule Tear / Extension',           5),
  ('complications', 'Dropped Nucleus / Lens Fragment',             6),
  ('complications', 'IOL Drop / Dislocation',                      7),
  ('complications', 'Iris Prolapse / Capture',                     8),
  ('complications', 'Intraoperative Miosis',                       9),
  ('complications', 'Hyphema',                                     10),
  ('complications', 'Corneal Edema (Intraoperative)',              11),
  ('complications', 'Wound Leak / Burn',                           12),
  ('complications', 'Suprachoroidal Haemorrhage',                  13),
  ('complications', 'Subconjunctival Haemorrhage',                 14),
  ('complications', 'Capsular Block Syndrome',                     15),
  ('complications', 'IOL Insertion Difficulty',                    16),
  ('complications', 'Patient Movement / Non-Cooperation',          17),
  ('complications', 'Anesthetic Complication',                     18),
  ('complications', 'Descemet''s Membrane Detachment',            19),
  ('complications', 'Thermal Burn (Phaco Port)',                   20);

-- ── Seed: Anaesthesia Notes / OVD ────────────────────────────────────────────

INSERT INTO intra_op_note_presets (field_name, option_label, display_order) VALUES
  ('anesthesia_notes', 'Topical – Proparacaine 0.5%',              1),
  ('anesthesia_notes', 'Topical – Oxybuprocaine 0.4%',             2),
  ('anesthesia_notes', 'Intracameral Lignocaine 1%',               3),
  ('anesthesia_notes', 'Sub-Tenon''s Block',                       4),
  ('anesthesia_notes', 'Peribulbar Block',                         5),
  ('anesthesia_notes', 'Retrobulbar Block',                        6),
  ('anesthesia_notes', 'General Anaesthesia (GA)',                  7),
  ('anesthesia_notes', 'Healon (Na-Hyaluronate 1%)',               8),
  ('anesthesia_notes', 'Healon GV / Healon 5',                     9),
  ('anesthesia_notes', 'Viscoat (Dispersive OVD)',                 10),
  ('anesthesia_notes', 'DisCoVisc',                                11),
  ('anesthesia_notes', 'ProVisc (Cohesive OVD)',                   12),
  ('anesthesia_notes', 'Amvisc Plus',                              13),
  ('anesthesia_notes', 'Methylcellulose / HPMC 2%',               14),
  ('anesthesia_notes', 'Duovisc (Viscoat + ProVisc)',              15),
  ('anesthesia_notes', 'OcuCoat',                                  16),
  ('anesthesia_notes', 'Adrenaline added to BSS (1:10,000)',       17),
  ('anesthesia_notes', 'Trypan Blue (Capsule Staining)',           18),
  ('anesthesia_notes', 'Triamcinolone (Vitreous Staining)',        19);

COMMIT;
