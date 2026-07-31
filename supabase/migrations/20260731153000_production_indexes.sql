-- supabase/migrations/20260731153000_production_indexes.sql

-- Listings queries (most important)
CREATE INDEX IF NOT EXISTS idx_listings_village_type 
  ON listings(village_id, type);
  
CREATE INDEX IF NOT EXISTS idx_listings_created_at 
  ON listings(village_id, created_at DESC);

-- Problems/Complaints
CREATE INDEX IF NOT EXISTS idx_complaints_village_status 
  ON complaints(village_id, status);
  
-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_village 
  ON announcements(village_id, created_at DESC);

-- Workers
CREATE INDEX IF NOT EXISTS idx_workers_village 
  ON listings(village_id) WHERE type = 'worker';

-- Search optimization
CREATE INDEX IF NOT EXISTS idx_listings_title_tsvector 
  ON listings USING gin(to_tsvector('english', title));
