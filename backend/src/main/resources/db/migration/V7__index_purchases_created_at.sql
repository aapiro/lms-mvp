-- Add index on purchases.purchased_at to speed up metrics queries
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at);
