-- Create CMS tables for flagship ecommerce functionality

-- Blog Categories
CREATE TABLE IF NOT EXISTS "blog_categories" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Blog Tags
CREATE TABLE IF NOT EXISTS "blog_tags" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS "blog_posts" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "author_id" UUID,
    "category_id" UUID REFERENCES "blog_categories"("id") ON DELETE SET NULL,
    "status" TEXT DEFAULT 'draft',
    "is_featured" BOOLEAN DEFAULT FALSE,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "view_count" INTEGER DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Blog Post Tags (many-to-many)
CREATE TABLE IF NOT EXISTS "blog_post_tags" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "post_id" UUID NOT NULL REFERENCES "blog_posts"("id") ON DELETE CASCADE,
    "tag_id" UUID NOT NULL REFERENCES "blog_tags"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    UNIQUE("post_id", "tag_id")
);

-- Banners/Sliders
CREATE TABLE IF NOT EXISTS "banners" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "mobile_image" TEXT,
    "link_url" TEXT,
    "link_text" TEXT,
    "position" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT TRUE,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Static Pages
CREATE TABLE IF NOT EXISTS "pages" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_published" BOOLEAN DEFAULT FALSE,
    "template" TEXT DEFAULT 'default',
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Product Images Gallery
CREATE TABLE IF NOT EXISTS "item_images" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "item_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "position" INTEGER DEFAULT 0,
    "is_primary" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Product Features/Specifications
CREATE TABLE IF NOT EXISTS "item_features" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "item_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Collections
CREATE TABLE IF NOT EXISTS "collections" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "is_featured" BOOLEAN DEFAULT FALSE,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Collection Items (many-to-many)
CREATE TABLE IF NOT EXISTS "collection_items" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "collection_id" UUID NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    UNIQUE("collection_id", "item_id")
);

-- Customer Reviews
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "item_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "title" TEXT,
    "content" TEXT,
    "is_verified" BOOLEAN DEFAULT FALSE,
    "is_approved" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS "subscribers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "subscribed_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- FAQ Entries
CREATE TABLE IF NOT EXISTS "faqs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "position" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS "testimonials" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "content" TEXT NOT NULL,
    "avatar_url" TEXT,
    "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
    "is_active" BOOLEAN DEFAULT TRUE,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_blog_posts_status" ON "blog_posts"("status");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_slug" ON "blog_posts"("slug");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_published_at" ON "blog_posts"("published_at");
CREATE INDEX IF NOT EXISTS "idx_banners_active" ON "banners"("is_active");
CREATE INDEX IF NOT EXISTS "idx_pages_slug" ON "pages"("slug");
CREATE INDEX IF NOT EXISTS "idx_item_images_item_id" ON "item_images"("item_id");
CREATE INDEX IF NOT EXISTS "idx_item_features_item_id" ON "item_features"("item_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_item_id" ON "reviews"("item_id");
CREATE INDEX IF NOT EXISTS "idx_collections_slug" ON "collections"("slug");
