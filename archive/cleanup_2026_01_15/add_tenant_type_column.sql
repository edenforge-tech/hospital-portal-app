-- Add tenant_type column to tenant table
ALTER TABLE tenant 
ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'Hospital';

-- Set existing tenants to 'Hospital' if NULL
UPDATE tenant 
SET tenant_type = 'Hospital' 
WHERE tenant_type IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tenant' AND column_name = 'tenant_type';
