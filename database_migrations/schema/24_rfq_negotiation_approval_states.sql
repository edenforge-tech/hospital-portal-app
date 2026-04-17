-- Migration: 24_rfq_negotiation_approval_states.sql
-- Adds NegotiationRequired and PendingFinalApproval to the RFQ status constraint
-- Run: psql $DATABASE_URL -f 24_rfq_negotiation_approval_states.sql

BEGIN;

-- Drop old constraint
ALTER TABLE inv_rfq_headers
  DROP CONSTRAINT IF EXISTS chk_rfq_status;

-- Re-add with two extra states
ALTER TABLE inv_rfq_headers
  ADD CONSTRAINT chk_rfq_status CHECK (
    rfq_status IN (
      'Draft',
      'Published',
      'ResponseWindowClosed',
      'EvaluationInProgress',
      'NegotiationRequired',
      'PendingFinalApproval',
      'Awarded',
      'Closed',
      'Cancelled'
    )
  );

COMMIT;
