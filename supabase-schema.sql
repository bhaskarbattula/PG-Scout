-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Areas table
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PG Listings table
CREATE TABLE pg_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  address TEXT,
  city TEXT NOT NULL,
  area TEXT,
  type TEXT NOT NULL DEFAULT 'pg' CHECK (type IN ('pg', 'hostel', 'dorm')),
  gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('boys', 'girls', 'unisex')),
  rent_min INTEGER NOT NULL,
  rent_max INTEGER,
  food_available BOOLEAN DEFAULT FALSE,
  wifi BOOLEAN DEFAULT FALSE,
  laundry BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  ac BOOLEAN DEFAULT FALSE,
  furnished BOOLEAN DEFAULT FALSE,
  rating DOUBLE PRECISION DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  phone TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('osm', 'scrape', 'manual')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full text search index
ALTER TABLE pg_listings ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(area, '')), 'B')
  ) STORED;

CREATE INDEX idx_pg_listings_search ON pg_listings USING GIN(search_vector);
CREATE INDEX idx_pg_listings_city ON pg_listings(city);
CREATE INDEX idx_pg_listings_area ON pg_listings(area);
CREATE INDEX idx_pg_listings_rent ON pg_listings(rent_min);
CREATE INDEX idx_pg_listings_gender ON pg_listings(gender);
CREATE INDEX idx_pg_listings_type ON pg_listings(type);
CREATE INDEX idx_pg_listings_geom ON pg_listings USING GIST(geom);

-- Insert sample cities
INSERT INTO cities (name, state, slug, image_url) VALUES
  ('Hyderabad', 'Telangana', 'hyderabad', 'https://images.unsplash.com/photo-1570168009549-0ef06e0e7c6c?w=800'),
  ('Bengaluru', 'Karnataka', 'bengaluru', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800'),
  ('Mumbai', 'Maharashtra', 'mumbai', 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800'),
  ('Delhi', 'Delhi', 'delhi', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'),
  ('Pune', 'Maharashtra', 'pune', 'https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?w=800'),
  ('Chennai', 'Tamil Nadu', 'chennai', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
  ('Kolkata', 'West Bengal', 'kolkata', 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800'),
  ('Noida', 'Uttar Pradesh', 'noida', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800');

-- Insert sample areas
INSERT INTO areas (name, slug, city_id, lat, lng) VALUES
  ('Gachibowli', 'gachibowli', (SELECT id FROM cities WHERE slug = 'hyderabad'), 17.44, 78.35),
  ('Hitech City', 'hitech-city', (SELECT id FROM cities WHERE slug = 'hyderabad'), 17.43, 78.35),
  ('Kukatpally', 'kukatpally', (SELECT id FROM cities WHERE slug = 'hyderabad'), 17.48, 78.41),
  ('Madhapur', 'madhapur', (SELECT id FROM cities WHERE slug = 'hyderabad'), 17.44, 78.39),
  ('Kondapur', 'kondapur', (SELECT id FROM cities WHERE slug = 'hyderabad'), 17.45, 78.36),
  ('Whitefield', 'whitefield', (SELECT id FROM cities WHERE slug = 'bengaluru'), 12.97, 77.73),
  ('Koramangala', 'koramangala', (SELECT id FROM cities WHERE slug = 'bengaluru'), 12.93, 77.62),
  ('Indiranagar', 'indiranagar', (SELECT id FROM cities WHERE slug = 'bengaluru'), 12.97, 77.64),
  ('HSR Layout', 'hsr-layout', (SELECT id FROM cities WHERE slug = 'bengaluru'), 12.91, 77.64),
  ('Andheri', 'andheri', (SELECT id FROM cities WHERE slug = 'mumbai'), 19.11, 72.85),
  ('Powai', 'powai', (SELECT id FROM cities WHERE slug = 'mumbai'), 19.12, 72.91),
  ('Malad', 'malad', (SELECT id FROM cities WHERE slug = 'mumbai'), 19.18, 72.85),
  ('Viman Nagar', 'viman-nagar', (SELECT id FROM cities WHERE slug = 'pune'), 18.56, 73.92),
  ('Hinjewadi', 'hinjewadi', (SELECT id FROM cities WHERE slug = 'pune'), 18.59, 73.74),
  ('Kharadi', 'kharadi', (SELECT id FROM cities WHERE slug = 'pune'), 18.55, 73.94);

-- Insert sample PG listings
INSERT INTO pg_listings (slug, name, description, lat, lng, address, city, area, type, gender, rent_min, rent_max, food_available, wifi, laundry, parking, ac, furnished, rating, review_count, images, phone, source)
VALUES
  ('cozy-mens-pg-gachibowli', 'Cozy Mens PG in Gachibowli', 'A comfortable PG for working professionals near Gachibowli IT corridor. Walking distance to major offices. Clean rooms with attached bathroom.', 17.442, 78.352, 'Plot 24, IT Corridor, Gachibowli, Hyderabad', 'Hyderabad', 'Gachibowli', 'pg', 'boys', 6000, 9000, true, true, true, false, true, true, 4.2, 34, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], '+919876543210', 'manual'),
  ('serene-girls-hostel-hitech', 'Serene Girls Hostel Hitech City', 'Safe and secure girls hostel with 24/7 security and CCTV. Close to Hitech City metro station. Nutritious meals provided.', 17.431, 78.348, 'Road 2, Hitech City, Hyderabad', 'Hyderabad', 'Hitech City', 'hostel', 'girls', 8000, 12000, true, true, true, true, true, true, 4.5, 56, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'], '+919876543211', 'manual'),
  ('urban-dorm-kukatpally', 'Urban Dorm Kukatpally', 'Affordable dormitory style accommodation near JNTU. Perfect for students. Common area with TV and gaming console.', 17.483, 78.412, 'Near JNTU, Kukatpally, Hyderabad', 'Hyderabad', 'Kukatpally', 'dorm', 'unisex', 3000, 5000, false, true, true, false, false, false, 3.8, 22, ARRAY['https://images.unsplash.com/photo-1590496793929-36417f9c1e7c?w=800'], '+919876543212', 'manual'),
  ('premium-pg-madhapur', 'Premium Unisex PG Madhapur', 'Premium PG with all modern amenities. Rooftop seating area, high-speed WiFi, and power backup. Near Madhapur police station.', 17.443, 78.392, 'Phase 2, Madhapur, Hyderabad', 'Hyderabad', 'Madhapur', 'pg', 'unisex', 10000, 15000, true, true, true, true, true, true, 4.7, 89, ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], '+919876543213', 'manual'),
  ('zolo-pg-kondapur', 'Zolo PG Kondapur', 'Part of Zolo chain. Fully furnished rooms, weekly cleaning, and community events. Close to Microsoft and Google offices.', 17.451, 78.362, 'Kondapur Main Road, Hyderabad', 'Hyderabad', 'Kondapur', 'pg', 'boys', 9000, 14000, true, true, false, true, true, true, 4.0, 45, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], '+919876543214', 'manual'),
  ('nestaway-pg-whitefield', 'NestAway PG Whitefield', 'Managed by NestAway. Fully managed PG with regular cleaning, laundry service, and high-speed internet. Near ITPL.', 12.972, 77.733, 'ITPL Main Road, Whitefield, Bengaluru', 'Bengaluru', 'Whitefield', 'pg', 'unisex', 7000, 12000, true, true, true, true, true, true, 4.3, 67, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], '+919876543215', 'manual'),
  ('oxygen-pg-koramangala', 'Oxygen PG Koramangala', 'Trendy PG in the heart of Koramangala. Walking distance to restaurants, cafes, and nightlife. Co-living space with events.', 12.932, 77.623, '80 Feet Road, Koramangala, Bengaluru', 'Bengaluru', 'Koramangala', 'pg', 'unisex', 8000, 13000, false, true, true, false, true, true, 4.4, 78, ARRAY['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'], '+919876543216', 'manual'),
  ('student-hostel-indiranagar', 'Student Hostel Indiranagar', 'Budget-friendly hostel for students near Indiranagar metro. Study rooms, library access, and vegetarian meals available.', 12.971, 77.642, 'Double Road, Indiranagar, Bengaluru', 'Bengaluru', 'Indiranagar', 'hostel', 'boys', 5000, 8000, true, true, false, false, false, false, 3.9, 31, ARRAY['https://images.unsplash.com/photo-1590496793929-36417f9c1e7c?w=800'], '+919876543217', 'manual'),
  ('colive-hsr-layout', 'Colive HSR Layout', 'Colive managed co-living space. Rooftop garden, gym access, and community events. Near Silk Board junction.', 12.913, 77.642, '27th Main, HSR Layout, Bengaluru', 'Bengaluru', 'HSR Layout', 'pg', 'unisex', 9000, 16000, true, true, true, true, true, true, 4.6, 92, ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], '+919876543218', 'manual'),
  ('girls-hostel-andheri', 'Girls Hostel Andheri West', 'Girls only hostel near Andheri West station. Close to Mumbai University. Home-cooked meals, AC rooms available.', 19.113, 72.852, 'Lokhandwala Complex, Andheri West, Mumbai', 'Mumbai', 'Andheri', 'hostel', 'girls', 7000, 11000, true, true, true, false, true, true, 4.1, 43, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'], '+919876543219', 'manual'),
  ('powai-lake-pg', 'Powai Lake View PG', 'Premium PG with lake view in Powai. Walking distance to Hiranandani Business Park. Premium amenities with gym.', 19.121, 72.912, 'Hiranandani Gardens, Powai, Mumbai', 'Mumbai', 'Powai', 'pg', 'boys', 12000, 18000, true, true, true, true, true, true, 4.5, 61, ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], '+919876543220', 'manual'),
  ('it-pg-hinjewadi', 'IT Professionals PG Hinjewadi', 'PG for IT professionals near Phase 3, Hinjewadi. Shuttle service to major IT parks. Power backup and high-speed WiFi.', 18.591, 73.742, 'Phase 3, Hinjewadi, Pune', 'Pune', 'Hinjewadi', 'pg', 'boys', 5000, 8000, true, true, true, true, false, true, 4.0, 38, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], '+919876543221', 'manual');
