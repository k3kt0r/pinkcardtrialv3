-- &Dine Express Card — Seed Data
-- Run this after schema.sql in Supabase SQL editor

-- ===================
-- ORGANISATIONS
-- ===================
INSERT INTO organisations (id, name, slug, allowed_domain, location) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Octopus Energy / Kraken', 'octopus-kraken', 'octopus.energy', 'Oxford St, W1'),
  ('a1000000-0000-0000-0000-000000000002', 'Kurt Geiger', 'kurt-geiger', 'kurtgeiger.com', 'Britton St, EC1M'),
  ('a1000000-0000-0000-0000-000000000003', 'Checkatrade', 'checkatrade', 'checkatrade.com', 'Ropemaker St, EC2Y'),
  ('a1000000-0000-0000-0000-000000000004', 'OpenTable', 'opentable', 'opentable.com', 'Finsbury Sq, EC2A');

-- ===================
-- MAKERS
-- ===================
INSERT INTO makers (id, name, address, postcode) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'B Bagel Soho', 'Wardour St', 'W1D'),
  ('b1000000-0000-0000-0000-000000000002', 'Eat Activ Soho', 'Noel St', 'W1F'),
  ('b1000000-0000-0000-0000-000000000003', 'Eat Activ Piccadilly', 'Brewer St', 'W1F'),
  ('b1000000-0000-0000-0000-000000000004', 'B Bagel Tottenham Ct Rd', 'Tottenham Ct Rd', 'W1T'),
  ('b1000000-0000-0000-0000-000000000005', 'Lantana Fitzrovia', 'Charlotte Pl', 'W1T'),
  ('b1000000-0000-0000-0000-000000000006', 'Pali Kitchen Gt Portland St', 'Gt Portland St', 'W1W'),
  ('b1000000-0000-0000-0000-000000000007', 'The Salad Project TCR', 'Tottenham Ct Rd', 'W1T'),
  ('b1000000-0000-0000-0000-000000000008', 'The Salad Kitchen Marylebone', 'Welbeck St', 'W1G'),
  ('b1000000-0000-0000-0000-000000000009', 'Papa-Dum James St', 'James St (Bond St)', 'W1U'),
  ('b1000000-0000-0000-0000-000000000010', 'B Bagel New Oxford St', 'New Oxford St', 'WC1A'),
  ('b1000000-0000-0000-0000-000000000011', 'Koshari Street Covent Garden', 'St Martin''s Ln', 'WC2N'),
  ('b1000000-0000-0000-0000-000000000012', 'Crust Bros Covent Garden', 'Bedford St', 'WC2E'),
  ('b1000000-0000-0000-0000-000000000013', 'Old Chang Kee', 'New Row', 'WC2N'),
  ('b1000000-0000-0000-0000-000000000014', 'Thunderbird Charing Cross', 'Villiers St', 'WC2N'),
  ('b1000000-0000-0000-0000-000000000015', 'atis Covent Garden', 'Long Acre', 'WC2E'),
  ('b1000000-0000-0000-0000-000000000016', 'atis Mayfair', 'North Audley St', 'W1K'),
  ('b1000000-0000-0000-0000-000000000017', 'Katsuma', 'Great Sutton St', 'EC1V'),
  ('b1000000-0000-0000-0000-000000000018', 'The Salad Kitchen Whitecross St', 'Whitecross St', 'EC1Y'),
  ('b1000000-0000-0000-0000-000000000019', 'atis Old Street', 'City Rd', 'EC1V'),
  ('b1000000-0000-0000-0000-000000000020', 'Hola Guacamole Barbican', 'Ropemaker St', 'EC2Y'),
  ('b1000000-0000-0000-0000-000000000021', 'Bonata New Street Square', 'New Street Square', 'EC4A'),
  ('b1000000-0000-0000-0000-000000000022', 'Little Banh Banh', 'Fleet St', 'EC4A'),
  ('b1000000-0000-0000-0000-000000000023', 'The Salad Project Spitalfields', 'Brushfield St', 'E1'),
  ('b1000000-0000-0000-0000-000000000024', 'Koshari Street Cannon St', 'Cannon St', 'EC4N'),
  ('b1000000-0000-0000-0000-000000000025', 'Papa-Dum London Wall', 'London Wall', 'EC2M'),
  ('b1000000-0000-0000-0000-000000000026', 'K10 Moorgate', 'Coleman St', 'EC2R'),
  ('b1000000-0000-0000-0000-000000000027', 'Rice Guys London Wall', 'London Wall', 'EC2M'),
  ('b1000000-0000-0000-0000-000000000028', 'Eat Activ City', 'Tower 42', 'EC2N'),
  ('b1000000-0000-0000-0000-000000000029', 'K10 Bank', 'Queen St', 'EC4N'),
  ('b1000000-0000-0000-0000-000000000030', 'Pali Kitchen Bow Lane', 'Bow Lane', 'EC4M'),
  ('b1000000-0000-0000-0000-000000000031', 'Rice Guys Bow Lane', 'Bow Lane', 'EC4M'),
  ('b1000000-0000-0000-0000-000000000032', 'Papa-Dum St Paul''s', 'St Paul''s', 'EC4M'),
  ('b1000000-0000-0000-0000-000000000033', 'K10 St Paul''s', 'St Paul''s', 'EC4M');

-- ===================
-- MAKER-OFFICE LINKS (walk times)
-- ===================

-- Octopus Energy / Kraken (a1...001)
INSERT INTO maker_offices (maker_id, organisation_id, walk_minutes) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 5),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 6),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 7),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 7),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 7),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 8),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 8),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 9),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 9),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 10),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 12),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 12),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000001', 13),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000001', 14),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001', 15),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000001', 16);

-- Kurt Geiger (a1...002)
INSERT INTO maker_offices (maker_id, organisation_id, walk_minutes) VALUES
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000002', 4),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000002', 8),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000002', 9),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000002', 10),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000002', 12),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000002', 13),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000002', 14),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000002', 15),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000002', 16);

-- Checkatrade (a1...003)
INSERT INTO maker_offices (maker_id, organisation_id, walk_minutes) VALUES
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000003', 2),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000003', 5),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000003', 6),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000003', 7),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000003', 7),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000003', 8),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000003', 9),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000003', 10),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000003', 11),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000003', 12),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000003', 13),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000003', 14),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000003', 15),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000003', 16);

-- OpenTable (a1...004)
INSERT INTO maker_offices (maker_id, organisation_id, walk_minutes) VALUES
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000004', 4),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004', 6),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000004', 7),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000004', 7),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000004', 8),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004', 8),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000004', 9),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004', 10),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000004', 11),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000004', 12),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000004', 13),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000004', 14),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000004', 16);

-- ===================
-- OFFERS (from briefing doc)
-- ===================

-- B Bagel Soho
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Free coffee with any bagel', 'Mon–Fri', 'free_item');
-- Eat Activ Soho
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'Free side with any bowl', NULL, 'free_item');
-- Eat Activ Piccadilly
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'Free side with any bowl', NULL, 'free_item');
-- B Bagel Tottenham Ct Rd
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000004', 'Free coffee with any bagel', NULL, 'free_item');
-- Lantana Fitzrovia
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000005', '10% off total order', NULL, 'discount');
-- Pali Kitchen Gt Portland St
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000006', 'Free side with any rice bowl', NULL, 'free_item');
-- The Salad Project TCR
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000007', 'Free protein upgrade on any bowl', NULL, 'upgrade');
-- The Salad Kitchen Marylebone
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000008', 'Free upgrade on any salad', NULL, 'upgrade');
-- Papa-Dum James St
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000009', 'Free mango lassi with any main', NULL, 'free_item');
-- B Bagel New Oxford St
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'Free coffee with any bagel', NULL, 'free_item');
-- Koshari Street Covent Garden
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000011', '10% off', NULL, 'discount');
-- Crust Bros Covent Garden
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000012', 'Free side with any pizza', NULL, 'free_item');
-- Old Chang Kee
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000013', 'Free curry puff with any main', NULL, 'free_item');
-- Thunderbird Charing Cross
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000014', 'Free side with any chicken', NULL, 'free_item');
-- atis Covent Garden
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000015', 'Free upgrade to large bowl', NULL, 'upgrade');
-- atis Mayfair
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000016', 'Free upgrade to large bowl', NULL, 'upgrade');
-- Katsuma
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000017', 'Free miso soup with any main', NULL, 'free_item');
-- The Salad Kitchen Whitecross St
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000018', 'Free upgrade on any salad', NULL, 'upgrade');
-- atis Old Street
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000019', 'Free upgrade to large bowl', NULL, 'upgrade');
-- Hola Guacamole Barbican
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000020', '10% off any order', NULL, 'discount');
-- Bonata New Street Square
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000021', 'Free side with any bowl', NULL, 'free_item');
-- Little Banh Banh
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000022', 'Free spring roll with any main', NULL, 'free_item');
-- The Salad Project Spitalfields
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000023', 'Free protein upgrade', NULL, 'upgrade');
-- Koshari Street Cannon St
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000024', '10% off', NULL, 'discount');
-- Papa-Dum London Wall
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000025', 'Free mango lassi with any main', NULL, 'free_item');
-- K10 Moorgate
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000026', 'Free side with any set', NULL, 'free_item');
-- Rice Guys London Wall
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000027', 'Free side with any bowl', NULL, 'free_item');
-- Eat Activ City
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000028', 'Free side with any bowl', NULL, 'free_item');
-- K10 Bank
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000029', 'Free side with any set', NULL, 'free_item');
-- Pali Kitchen Bow Lane
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000030', 'Free side with any rice bowl', NULL, 'free_item');
-- Rice Guys Bow Lane
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000031', 'Free side with any bowl', NULL, 'free_item');
-- Papa-Dum St Paul's
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000032', 'Free mango lassi with any main', NULL, 'free_item');
-- K10 St Paul's
INSERT INTO offers (maker_id, title, description, offer_type) VALUES
  ('b1000000-0000-0000-0000-000000000033', 'Free side with any set', NULL, 'free_item');
