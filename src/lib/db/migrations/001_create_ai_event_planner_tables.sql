-- Migration: Create AI Event Planner Tables
-- Description: Creates tables for event plan requests, results, and vendor categories
-- Date: 2025-01-10

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- ============================================================================
-- Table: event_plan_requests
-- Description: Stores anonymous and authenticated event planning requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_plan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'wedding', 'corporate', 'birthday', 'graduation', 'conference', 'other'
  )),
  event_date TIMESTAMP NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count >= 1 AND guest_count <= 10000),
  event_description TEXT NOT NULL CHECK (char_length(event_description) >= 50 AND char_length(event_description) <= 1000),
  
  -- Location Data
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(100) NOT NULL,
  location_country VARCHAR(100) NOT NULL DEFAULT 'USA',
  
  -- Guest Class Data (stored as JSONB for flexibility)
  guest_class_data JSONB NOT NULL,
  
  -- Budget Information
  budget_amount DECIMAL(12, 2) NOT NULL CHECK (budget_amount > 0),
  budget_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Request Metadata
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN (
    'processing', 'completed', 'failed', 'expired'
  )),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for event_plan_requests
CREATE INDEX idx_event_plan_requests_session_token ON event_plan_requests(session_token);
CREATE INDEX idx_event_plan_requests_user_id ON event_plan_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_event_plan_requests_location ON event_plan_requests(location_latitude, location_longitude) WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;
CREATE INDEX idx_event_plan_requests_created_at ON event_plan_requests(created_at);
CREATE INDEX idx_event_plan_requests_expires_at ON event_plan_requests(expires_at);
CREATE INDEX idx_event_plan_requests_status ON event_plan_requests(status);
CREATE INDEX idx_event_plan_requests_event_type ON event_plan_requests(event_type);

-- ============================================================================
-- Table: event_plan_results
-- Description: Stores AI-generated event plan analysis and results
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_plan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES event_plan_requests(id) ON DELETE CASCADE,
  
  -- Analysis Data (stored as JSONB for flexibility)
  analysis_data JSONB NOT NULL,
  teaser_data JSONB NOT NULL,
  full_plan_data JSONB,
  
  -- Metrics
  feasibility_score INTEGER CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for event_plan_results
CREATE INDEX idx_event_plan_results_request_id ON event_plan_results(request_id);
CREATE INDEX idx_event_plan_results_created_at ON event_plan_results(created_at);

-- ============================================================================
-- Table: vendor_categories
-- Description: Stores vendor category definitions for event planning
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for vendor_categories
CREATE INDEX idx_vendor_categories_name ON vendor_categories(name);
CREATE INDEX idx_vendor_categories_is_active ON vendor_categories(is_active);

-- ============================================================================
-- Alter vendors table to add event planning fields
-- Description: Adds columns needed for AI event planner functionality
-- ============================================================================

-- Add event types array column
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS event_types VARCHAR(50)[] DEFAULT '{}';

-- Add pricing columns
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS average_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(10, 2);

-- Add location columns for geospatial queries
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add availability status
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available' 
CHECK (availability_status IN ('available', 'limited', 'unavailable'));

-- Create geospatial index using PostGIS
CREATE INDEX IF NOT EXISTS idx_vendors_location_gist 
ON vendors USING GIST (ll_to_earth(latitude, longitude)) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create GIN index for event_types array
CREATE INDEX IF NOT EXISTS idx_vendors_event_types 
ON vendors USING GIN (event_types);

-- Create index for availability
CREATE INDEX IF NOT EXISTS idx_vendors_availability 
ON vendors(availability_status);

-- ============================================================================
-- Seed vendor_categories table with initial data
-- ============================================================================
INSERT INTO vendor_categories (name, display_name, description, icon, sort_order) VALUES
  ('venue', 'Event Venue', 'Locations for hosting events including halls, hotels, and outdoor spaces', 'building', 1),
  ('catering', 'Catering', 'Food and beverage services for events', 'utensils', 2),
  ('entertainment', 'Entertainment', 'DJs, bands, performers, and entertainment services', 'music', 3),
  ('photography', 'Photography', 'Professional photography services', 'camera', 4),
  ('videography', 'Videography', 'Professional videography and video production', 'video', 5),
  ('decoration', 'Decoration', 'Event decoration and styling services', 'palette', 6),
  ('florals', 'Florals', 'Floral arrangements and bouquets', 'flower', 7),
  ('transportation', 'Transportation', 'Transportation services for guests', 'car', 8),
  ('car_rental', 'Car Rental', 'Luxury and specialty vehicle rentals', 'car-side', 9),
  ('audio_visual', 'Audio/Visual', 'Sound systems, lighting, and AV equipment', 'speaker', 10),
  ('event_planning', 'Event Planning', 'Professional event planning and coordination', 'clipboard', 11),
  ('security', 'Security', 'Event security services', 'shield', 12),
  ('valet_parking', 'Valet Parking', 'Valet parking services', 'parking', 13),
  ('rentals', 'Rentals', 'Tables, chairs, linens, and equipment rentals', 'box', 14),
  ('cake_desserts', 'Cake & Desserts', 'Wedding cakes and dessert services', 'cake', 15),
  ('bar_services', 'Bar Services', 'Bartending and beverage services', 'glass', 16),
  ('lighting', 'Lighting', 'Event lighting and ambiance', 'lightbulb', 17),
  ('invitations', 'Invitations', 'Invitation design and printing', 'envelope', 18),
  ('favors_gifts', 'Favors & Gifts', 'Party favors and guest gifts', 'gift', 19)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Create function to automatically update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_event_plan_requests_updated_at
  BEFORE UPDATE ON event_plan_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_plan_results_updated_at
  BEFORE UPDATE ON event_plan_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_categories_updated_at
  BEFORE UPDATE ON vendor_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create function to automatically delete expired sessions
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_expired_event_plans()
RETURNS void AS $$
BEGIN
  DELETE FROM event_plan_requests 
  WHERE expires_at < NOW() AND status = 'expired';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE event_plan_requests IS 'Stores event planning requests from both anonymous and authenticated users';
COMMENT ON TABLE event_plan_results IS 'Stores AI-generated event plan analysis and recommendations';
COMMENT ON TABLE vendor_categories IS 'Defines vendor categories available for event planning';
COMMENT ON COLUMN event_plan_requests.session_token IS 'Unique token for anonymous session management (24 hour expiry)';
COMMENT ON COLUMN event_plan_requests.guest_class_data IS 'JSONB containing age groups, formality, social status, and special requirements';
COMMENT ON COLUMN event_plan_results.analysis_data IS 'Complete analysis including vendor data, budget allocation, and recommendations';
COMMENT ON COLUMN event_plan_results.teaser_data IS 'Limited preview data shown to non-authenticated users';
COMMENT ON COLUMN event_plan_results.full_plan_data IS 'Complete plan with vendor details, only available to authenticated users';
