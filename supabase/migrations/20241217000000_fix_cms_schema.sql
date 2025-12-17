-- Fix CMS schema issues to match application code

-- Add is_featured column to testimonials if not exists
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN DEFAULT FALSE;

-- Fix banners table - ensure button_text column exists (used in catalog)
ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "button_text" TEXT;

-- Copy link_text to button_text if button_text is empty
UPDATE "banners" SET button_text = link_text WHERE button_text IS NULL AND link_text IS NOT NULL;

-- Create index for featured testimonials
CREATE INDEX IF NOT EXISTS "idx_testimonials_featured" ON "testimonials"("is_featured") WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS "idx_testimonials_active" ON "testimonials"("is_active") WHERE is_active = true;

-- Create index for FAQs
CREATE INDEX IF NOT EXISTS "idx_faqs_active" ON "faqs"("is_active") WHERE is_active = true;
CREATE INDEX IF NOT EXISTS "idx_faqs_category" ON "faqs"("category");
