-- PostGIS function for nearby PG listings
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION nearby_listings(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS SETOF pg_listings
LANGUAGE SQL
STABLE
AS $$
  SELECT *
  FROM pg_listings
  WHERE ST_DWithin(
    geom,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY
    ST_Distance(
      geom,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    );
$$;
