-- Comprehensive fix for audit_log table schema mismatch
-- Adds all missing columns required by the AuditLog C# model

DO $$ 
BEGIN
    -- Add DataClassification column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'DataClassification') THEN
        ALTER TABLE audit_log ADD COLUMN "DataClassification" TEXT DEFAULT 'Internal';
        RAISE NOTICE 'Added DataClassification column';
    END IF;

    -- Add RiskLevel column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'RiskLevel') THEN
        ALTER TABLE audit_log ADD COLUMN "RiskLevel" TEXT DEFAULT 'Low';
        RAISE NOTICE 'Added RiskLevel column';
    END IF;

    -- Add EventHash column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'EventHash') THEN
        ALTER TABLE audit_log ADD COLUMN "EventHash" TEXT NULL;
        RAISE NOTICE 'Added EventHash column';
    END IF;

    -- Add PreviousEventHash column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'PreviousEventHash') THEN
        ALTER TABLE audit_log ADD COLUMN "PreviousEventHash" TEXT NULL;
        RAISE NOTICE 'Added PreviousEventHash column';
    END IF;

    -- Add SequenceNumber column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'SequenceNumber') THEN
        ALTER TABLE audit_log ADD COLUMN "SequenceNumber" BIGINT NULL;
        RAISE NOTICE 'Added SequenceNumber column';
    END IF;

    -- Add IsSystemGenerated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'IsSystemGenerated') THEN
        ALTER TABLE audit_log ADD COLUMN "IsSystemGenerated" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added IsSystemGenerated column';
    END IF;

    -- Add SessionId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'SessionId') THEN
        ALTER TABLE audit_log ADD COLUMN "SessionId" TEXT NULL;
        RAISE NOTICE 'Added SessionId column';
    END IF;

    -- Add IsImmutable column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'IsImmutable') THEN
        ALTER TABLE audit_log ADD COLUMN "IsImmutable" BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added IsImmutable column';
    END IF;

    -- Add RetentionDays column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'RetentionDays') THEN
        ALTER TABLE audit_log ADD COLUMN "RetentionDays" INTEGER DEFAULT 2555;
        RAISE NOTICE 'Added RetentionDays column';
    END IF;

    -- Add RetentionExpiry column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'RetentionExpiry') THEN
        ALTER TABLE audit_log ADD COLUMN "RetentionExpiry" TIMESTAMP WITH TIME ZONE NULL;
        RAISE NOTICE 'Added RetentionExpiry column';
    END IF;

    -- Add Timestamp column (alias for created_at)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_log' AND column_name = 'Timestamp') THEN
        ALTER TABLE audit_log ADD COLUMN "Timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added Timestamp column';
    END IF;

    RAISE NOTICE 'Audit log schema fix completed successfully';
END $$;

-- Display all columns to verify
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
ORDER BY ordinal_position;
