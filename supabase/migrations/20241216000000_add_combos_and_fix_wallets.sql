-- Migration: Add combo products, fix seller/location/wallet relationships
-- Date: 2024-12-16
-- This migration creates a UNIFIED FINANCIAL MODEL:
-- - Locations are the core entity (each location = seller/store)
-- - Each location has wallets (Cash SRD, Cash USD, Bank SRD, Bank USD)
-- - Sales credit wallets, Expenses debit wallets
-- - Commissions are calculated per location based on location's commission_rate

-- =====================================================
-- STEP 1: Add combo product support to items
-- =====================================================

-- Add is_combo and allow_custom_price flags to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false;
ALTER TABLE items ADD COLUMN IF NOT EXISTS allow_custom_price BOOLEAN DEFAULT false;

-- Create combo_items table to track which items are in a combo
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  child_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_item_id, child_item_id)
);

CREATE INDEX IF NOT EXISTS idx_combo_items_parent ON combo_items(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_child ON combo_items(child_item_id);

-- =====================================================
-- STEP 2: Fix Location = Seller (unified concept)
-- Each location IS a seller with embedded seller info
-- =====================================================

-- Add seller fields directly to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- STEP 3: Fix Wallets - MUST belong to a location
-- Remove person_name concept, wallets are location-based
-- =====================================================

-- Add location_id to wallets (REQUIRED for new wallets)
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;

-- Create index for location wallets
CREATE INDEX IF NOT EXISTS idx_wallets_location ON wallets(location_id);

-- Make person_name nullable (for migration, will be removed later)
ALTER TABLE wallets ALTER COLUMN person_name DROP NOT NULL;

-- =====================================================
-- STEP 4: Add wallet_id to sales and expenses
-- =====================================================

ALTER TABLE sales ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 5: Add custom_price to sale_items
-- =====================================================

ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS is_custom_price BOOLEAN DEFAULT false;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- =====================================================
-- STEP 6: Create wallet_transactions table for audit trail
-- Tracks all money in/out: sales, expenses, transfers, adjustments
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'credit' or 'debit'
  amount DECIMAL(10, 2) NOT NULL,
  previous_balance DECIMAL(10, 2) NOT NULL,
  new_balance DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'sale', 'expense', 'transfer', 'adjustment', 'commission_payout'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_sale ON wallet_transactions(sale_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_expense ON wallet_transactions(expense_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(reference_type);

-- =====================================================
-- STEP 7: Add location_id and commission_rate to commissions (replace seller_id dependency)
-- =====================================================

ALTER TABLE commissions ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;

-- =====================================================
-- STEP 8: Update triggers
-- =====================================================

-- Add trigger for locations updated_at
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for items updated_at (if not exists)
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES FOR DATA MIGRATION (run manually if needed):
-- =====================================================
-- 1. For existing wallets without location_id:
--    UPDATE wallets SET location_id = (SELECT id FROM locations LIMIT 1) WHERE location_id IS NULL;
-- 
-- 2. For existing commissions, migrate seller_id to location_id:
--    UPDATE commissions c SET location_id = s.location_id FROM sellers s WHERE c.seller_id = s.id;
--
-- 3. After migration, you can optionally:
--    - DROP TABLE sellers CASCADE;
--    - DROP TABLE seller_category_rates CASCADE;
--    - ALTER TABLE wallets DROP COLUMN person_name;
