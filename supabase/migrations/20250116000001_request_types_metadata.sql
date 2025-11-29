-- Add support for new request types and metadata field
-- Generated: 2025-01-16

-- Add metadata column to requests table (if not exists)
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN requests.metadata IS 'Additional JSON data specific to request type (partnership, board_nomination, feedback, etc.)';

-- Update the CHECK constraint to support new request types
-- First, drop the existing constraint
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_type_check;

-- Add new constraint with all request types
ALTER TABLE requests
  ADD CONSTRAINT requests_type_check 
  CHECK (type IN ('buy', 'sell', 'partnership', 'board_nomination', 'feedback'));

-- Update amount constraint to allow NULL for non-financial request types
-- First, make the amount column nullable
ALTER TABLE requests
  ALTER COLUMN amount DROP NOT NULL;

-- Drop existing constraint
ALTER TABLE requests
  DROP CONSTRAINT IF EXISTS requests_amount_check;

-- Add new constraint that allows NULL for non-financial types
ALTER TABLE requests
  ADD CONSTRAINT requests_amount_check 
  CHECK (
    -- For buy/sell, amount must be positive
    (type IN ('buy', 'sell') AND amount IS NOT NULL AND amount > 0) OR
    -- For other types, amount can be NULL or positive
    (type NOT IN ('buy', 'sell') AND (amount IS NULL OR amount > 0))
  );

-- Update type column size to accommodate longer type names
ALTER TABLE requests
  ALTER COLUMN type TYPE VARCHAR(20);

COMMENT ON TABLE requests IS 'Investment and partnership requests with support for multiple request types';

