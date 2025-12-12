-- Add description and is_public columns to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, staff
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table if not exists
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  details TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Create index for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for public items (for catalog)
CREATE INDEX IF NOT EXISTS idx_items_public ON items(is_public) WHERE is_public = true;

-- Create function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Store settings table for WhatsApp number etc
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for store_settings updated_at
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default WhatsApp number (update this with actual number)
INSERT INTO store_settings (key, value) VALUES ('whatsapp_number', '+597XXXXXXXX') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_name', 'NextX Store') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_currency', 'SRD') ON CONFLICT (key) DO NOTHING;
