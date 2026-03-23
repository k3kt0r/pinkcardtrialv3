-- &Dine Express Card — Database Schema
-- Run this in your Supabase SQL editor

-- Organisations (pilot offices)
CREATE TABLE organisations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  allowed_domain TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Makers (food vendors)
CREATE TABLE makers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  nfc_token TEXT UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Which makers serve which offices (with walk time)
CREATE TABLE maker_offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maker_id UUID NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  walk_minutes INTEGER NOT NULL,
  UNIQUE(maker_id, organisation_id)
);

-- Offers per maker
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maker_id UUID NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('free_item', 'discount', 'upgrade', 'special')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  organisation_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Redemptions
CREATE TABLE redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id),
  maker_id UUID NOT NULL REFERENCES makers(id),
  organisation_id UUID NOT NULL REFERENCES organisations(id),
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Featured maker per org per day
CREATE TABLE featured_makers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(organisation_id, date)
);

-- Maker PINs (fallback for NFC)
CREATE TABLE maker_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maker_id UUID NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  pin_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_maker_offices_org ON maker_offices(organisation_id);
CREATE INDEX idx_maker_offices_maker ON maker_offices(maker_id);
CREATE INDEX idx_offers_maker ON offers(maker_id);
CREATE INDEX idx_offers_active ON offers(active) WHERE active = true;
CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_redemptions_user_date ON redemptions(user_id, redeemed_at);
CREATE INDEX idx_featured_makers_org_date ON featured_makers(organisation_id, date);
CREATE INDEX idx_maker_pins_maker ON maker_pins(maker_id);
CREATE INDEX idx_user_profiles_org ON user_profiles(organisation_id);

-- Row Level Security
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maker_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maker_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organisations: anyone authenticated can read
CREATE POLICY "Organisations are viewable by authenticated users"
  ON organisations FOR SELECT
  TO authenticated
  USING (true);

-- Makers: anyone authenticated can read
CREATE POLICY "Makers are viewable by authenticated users"
  ON makers FOR SELECT
  TO authenticated
  USING (true);

-- Maker offices: anyone authenticated can read
CREATE POLICY "Maker offices are viewable by authenticated users"
  ON maker_offices FOR SELECT
  TO authenticated
  USING (true);

-- Offers: anyone authenticated can read active offers
CREATE POLICY "Active offers are viewable by authenticated users"
  ON offers FOR SELECT
  TO authenticated
  USING (active = true);

-- User profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Redemptions: users can read their own and insert their own
CREATE POLICY "Users can view own redemptions"
  ON redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
  ON redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Featured makers: anyone authenticated can read
CREATE POLICY "Featured makers are viewable by authenticated users"
  ON featured_makers FOR SELECT
  TO authenticated
  USING (true);

-- Maker pins: anyone authenticated can read (needed for PIN fallback)
CREATE POLICY "Maker pins are viewable by authenticated users"
  ON maker_pins FOR SELECT
  TO authenticated
  USING (true);
