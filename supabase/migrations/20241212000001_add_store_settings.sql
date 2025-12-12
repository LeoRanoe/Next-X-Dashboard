-- Create store_settings table for managing webshop and store configuration
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for store_settings updated_at (reuse existing function)
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at 
  BEFORE UPDATE ON store_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings with actual values
INSERT INTO store_settings (key, value) VALUES 
  ('whatsapp_number', '+5978318508'),
  ('store_name', 'NextX'),
  ('store_currency', 'SRD'),
  ('store_address', 'Commewijne, Noord'),
  ('store_email', ''),
  ('store_description', ''),
  ('store_logo_url', ''),
  ('hero_title', 'Welkom'),
  ('hero_subtitle', '')
ON CONFLICT (key) DO NOTHING;
