-- Migration: Add combo products, fix seller/location/wallet relationships
-- Date: 2024-12-16

-- =====================================================
-- STEP 1: Add combo product support to items
-- =====================================================

-- Add is_combo and allow_custom_price flags to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false;
ALTER TABLE items ADD COLUMN IF NOT EXISTS allow_custom_price BOOLEAN DEFAULT false;

-- Create combo_items table to track which items are in a combo
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combo_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(combo_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_combo_items_combo ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_item ON combo_items(item_id);

-- =====================================================
-- STEP 2: Fix Location/Seller relationship
-- Each location can have seller info directly (no separate seller entity needed)
-- =====================================================

-- Add seller fields directly to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- STEP 3: Fix Wallets - Link to locations
-- Each location has its own wallet for tracking sales money
-- =====================================================

-- Add location_id to wallets (optional - for location-specific wallets)
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Create index for location wallets
CREATE INDEX IF NOT EXISTS idx_wallets_location ON wallets(location_id);

-- =====================================================
-- STEP 4: Add wallet_id to sales for tracking
-- =====================================================

ALTER TABLE sales ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 5: Add custom_price to sale_items
-- =====================================================

ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS is_custom_price BOOLEAN DEFAULT false;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- =====================================================
-- STEP 6: Create wallet_transactions table for audit trail
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'sale', 'expense', 'transfer_in', 'transfer_out', 'adjustment'
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_sale ON wallet_transactions(sale_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- =====================================================
-- STEP 7: Update triggers
-- =====================================================

-- Add trigger for locations updated_at
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for items updated_at (if not exists)
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
