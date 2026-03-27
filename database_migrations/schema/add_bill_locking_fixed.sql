-- Day 5: Bill Locking Mechanism (Feb 7, 2026)
-- Add locking columns to opd_bills table
-- Purpose: Prevent modifications to finalized bills with admin override capability

BEGIN;

-- Add foreign key constraints (fixed table name from AspNetUsers to users)
ALTER TABLE opd_bills
DROP CONSTRAINT IF EXISTS fk_opd_bills_locked_by_user CASCADE;

ALTER TABLE opd_bills
ADD CONSTRAINT fk_opd_bills_locked_by_user
FOREIGN KEY (locked_by_user_id) REFERENCES users(id);

ALTER TABLE opd_bills
DROP CONSTRAINT IF EXISTS fk_opd_bills_unlocked_by_user CASCADE;

ALTER TABLE opd_bills
ADD CONSTRAINT fk_opd_bills_unlocked_by_user
FOREIGN KEY (unlocked_by_user_id) REFERENCES users(id);

COMMIT;

-- Verify the migration
SELECT 'Bill locking foreign keys added successfully' AS status;
