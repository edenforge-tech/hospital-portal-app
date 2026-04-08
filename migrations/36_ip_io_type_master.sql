-- ─── IP I/O Type Master Table ─────────────────────────────────────────────────
-- Global master data (no tenant_id) — shared across all hospitals.
-- Used by the Nurse Records tab in Ward Updation modal for structured
-- Intake / Output quick-add chips.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ip_io_type (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    category      VARCHAR(20)  NOT NULL CHECK (category IN ('Intake', 'Output')),
    label         VARCHAR(100) NOT NULL,
    unit          VARCHAR(30),
    display_order INT          NOT NULL DEFAULT 0,
    status        VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed rows (idempotent via DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ip_io_type LIMIT 1) THEN
        INSERT INTO ip_io_type (id, category, label, unit, display_order) VALUES
            (uuid_generate_v4(), 'Intake',  'IV Normal Saline (NS)',     'ml',  1),
            (uuid_generate_v4(), 'Intake',  'IV Ringer''s Lactate (RL)', 'ml',  2),
            (uuid_generate_v4(), 'Intake',  'IV Dextrose 5% (D5W)',      'ml',  3),
            (uuid_generate_v4(), 'Intake',  'IV Antibiotic Drip',        'ml',  4),
            (uuid_generate_v4(), 'Intake',  'Blood Transfusion',         'ml',  5),
            (uuid_generate_v4(), 'Intake',  'Oral Fluids',               'ml',  6),
            (uuid_generate_v4(), 'Intake',  'Eye Drops Administered',    NULL,  7),
            (uuid_generate_v4(), 'Output',  'Urine Output',              'ml', 10),
            (uuid_generate_v4(), 'Output',  'Estimated Blood Loss',      'ml', 11),
            (uuid_generate_v4(), 'Output',  'Wound Drain',               'ml', 12),
            (uuid_generate_v4(), 'Output',  'NGT Drainage',              'ml', 13),
            (uuid_generate_v4(), 'Output',  'Vomitus',                   'ml', 14);
    END IF;
END;
$$;
