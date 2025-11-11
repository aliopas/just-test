-- Bacura stock snapshots seed and investor market permission
-- Generated: 2025-11-11

CREATE TABLE IF NOT EXISTS bacura_stock_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  open_price NUMERIC(12, 2) NOT NULL,
  high_price NUMERIC(12, 2) NOT NULL,
  low_price NUMERIC(12, 2) NOT NULL,
  close_price NUMERIC(12, 2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bacura_stock_snapshots_recorded_at
  ON bacura_stock_snapshots (recorded_at);

ALTER TABLE bacura_stock_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bacura_stock_snapshots'
      AND policyname = 'Investors can read Bacura stock snapshots'
  ) THEN
    CREATE POLICY "Investors can read Bacura stock snapshots"
      ON bacura_stock_snapshots
      FOR SELECT
      USING (
        fn_user_has_permission(auth.uid(), 'investor.market.read')
        OR fn_user_has_permission(auth.uid(), 'admin.requests.review')
      );
  END IF;
END $$;

WITH day_series AS (
  SELECT
    generate_series(
      CURRENT_DATE - INTERVAL '59 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    ) AS day,
    ROW_NUMBER() OVER (ORDER BY generate_series) - 1 AS idx
),
base AS (
  SELECT
    (day + TIME '15:00')::timestamptz AS recorded_at,
    92.5 + idx * 0.24 + SIN(idx / 3.7) * 1.35 AS open_raw,
    idx
  FROM day_series
),
calc AS (
  SELECT
    recorded_at,
    open_raw,
    open_raw + COS(idx / 2.9) * 0.95 AS close_raw,
    idx,
    1.15 + ABS(SIN(idx / 4.5)) AS up_swing,
    0.9 + ABS(COS(idx / 5.1)) * 0.7 AS down_swing,
    145000 + idx * 1850 + (SIN(idx / 2.8) * 12500) AS volume_raw
  FROM base
),
normalized AS (
  SELECT
    recorded_at,
    ROUND(open_raw::numeric, 2) AS open_price,
    ROUND(close_raw::numeric, 2) AS close_price,
    ROUND(
      (
        GREATEST(open_raw, close_raw) + up_swing
      )::numeric,
      2
    ) AS high_price,
    ROUND(
      (
        LEAST(open_raw, close_raw) - down_swing
      )::numeric,
      2
    ) AS low_price,
    GREATEST(ROUND(volume_raw)::bigint, 10000) AS volume
  FROM calc
)
INSERT INTO bacura_stock_snapshots (
  recorded_at,
  open_price,
  high_price,
  low_price,
  close_price,
  volume
)
SELECT
  n.recorded_at,
  n.open_price,
  GREATEST(n.high_price, n.open_price, n.close_price) AS high_price,
  GREATEST(LEAST(n.low_price, n.open_price, n.close_price), 0.01) AS low_price,
  GREATEST(n.close_price, 0.01) AS close_price,
  n.volume
FROM normalized n
WHERE NOT EXISTS (
  SELECT 1 FROM bacura_stock_snapshots
)
ORDER BY n.recorded_at;

INSERT INTO permissions (slug, name, description, category)
VALUES (
  'investor.market.read',
  'متابعة سوق باكورة',
  'السماح للمستثمر بمتابعة بيانات أسهم باكورة ومؤشراتها',
  'investor'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

DO $$
DECLARE
  investor_role_id UUID;
  permission_id UUID;
BEGIN
  SELECT id INTO investor_role_id FROM roles WHERE slug = 'investor';
  SELECT id INTO permission_id FROM permissions WHERE slug = 'investor.market.read';

  IF investor_role_id IS NOT NULL AND permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id, grant_type)
    VALUES (investor_role_id, permission_id, 'allow')
    ON CONFLICT (role_id, permission_id) DO UPDATE
    SET grant_type = 'allow';
  END IF;
END $$;

