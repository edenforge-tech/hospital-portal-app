-- Migration: add document_url to pre_op_test_orders
-- Phase 1: Store result document URL (Azure Blob) on pre-op test orders
-- Run once against hospitalportal database

ALTER TABLE pre_op_test_orders
  ADD COLUMN IF NOT EXISTS document_url TEXT;

COMMENT ON COLUMN pre_op_test_orders.document_url IS
  'Azure Blob URL of the uploaded result document (PDF/image) attached when marking results received.';
