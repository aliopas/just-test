-- Fix requests.amount and requests.currency to be nullable for non-financial request types
-- This migration ensures the amount and currency columns can be NULL for partnership, board_nomination, and feedback requests
-- Generated: 2025-01-20

-- Make the amount column nullable (safe to run even if already nullable)
ALTER TABLE requests
  ALTER COLUMN amount DROP NOT NULL;

-- Make the currency column nullable (safe to run even if already nullable)
ALTER TABLE requests
  ALTER COLUMN currency DROP NOT NULL;

-- Ensure the amount constraint allows NULL for non-financial types
-- Drop existing constraint if it exists
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_amount_check;

-- Add constraint that allows NULL for non-financial types
ALTER TABLE requests
  ADD CONSTRAINT requests_amount_check 
  CHECK (
    -- For buy/sell, amount must be positive and not null
    (type IN ('buy', 'sell') AND amount IS NOT NULL AND amount > 0) OR
    -- For other types, amount can be NULL or positive
    (type NOT IN ('buy', 'sell') AND (amount IS NULL OR amount > 0))
  );

COMMENT ON COLUMN requests.amount IS 'Amount in currency. Required for buy/sell requests, optional for partnership/board_nomination/feedback requests.';
COMMENT ON COLUMN requests.currency IS 'Currency code (SAR, USD, EUR). Required for buy/sell requests, optional for partnership/board_nomination/feedback requests.';

