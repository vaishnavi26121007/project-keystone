-- ==========================================================
-- Project KEYSTONE - Sample Seed Data
-- ==========================================================
-- Run this AFTER the Spring Boot app has started once
-- (so Hibernate has auto-created the tables via ddl-auto=update).
--
-- All demo user passwords are: Password123!
-- (BCrypt hash below corresponds to that plaintext password)
-- ==========================================================

-- Sample client organization
INSERT INTO clients (company_name, contact_email, contact_phone, billing_address, sla_tier, created_at)
VALUES ('Meridian Facilities Management', 'ops@meridianfm.com', '555-0100', '100 Meridian Way, Austin, TX', 'PREMIUM', NOW());

-- Sample site under that client
INSERT INTO sites (name, address, city, state, postal_code, client_id)
VALUES ('Meridian Tower - Downtown Campus', '450 Congress Ave', 'Austin', 'TX', '78701', 1);

-- Sample assets at that site
INSERT INTO assets (name, asset_tag, category, manufacturer, model_number, serial_number, site_id)
VALUES
  ('Rooftop HVAC Unit 3', 'HVAC-003', 'HVAC', 'Carrier', 'RTU-5000', 'SN-88213', 1),
  ('Main Freight Elevator', 'ELEV-01', 'Elevator', 'Otis', 'Gen2-Premier', 'SN-77120', 1),
  ('Emergency Generator', 'GEN-01', 'Electrical', 'Generac', 'Protector-150kW', 'SN-99045', 1);

-- Demo users (password for all: Password123!)
-- BCrypt hash: $2a$10$8K1p/a0dURXAmoWUJvJs6.nCiJnjs2xw7C7fLKRQhKWMr9hn6JVdC
INSERT INTO users (full_name, email, password, phone, role, active, client_id, created_at) VALUES
 ('Alex Admin', 'admin@keystone.dev', '$2a$10$8K1p/a0dURXAmoWUJvJs6.nCiJnjs2xw7C7fLKRQhKWMr9hn6JVdC', '555-0001', 'ADMIN', true, NULL, NOW()),
 ('Dana Dispatcher', 'dispatcher@keystone.dev', '$2a$10$8K1p/a0dURXAmoWUJvJs6.nCiJnjs2xw7C7fLKRQhKWMr9hn6JVdC', '555-0002', 'DISPATCHER', true, NULL, NOW()),
 ('Tom Technician', 'tech@keystone.dev', '$2a$10$8K1p/a0dURXAmoWUJvJs6.nCiJnjs2xw7C7fLKRQhKWMr9hn6JVdC', '555-0003', 'TECHNICIAN', true, NULL, NOW()),
 ('Casey Client', 'client@keystone.dev', '$2a$10$8K1p/a0dURXAmoWUJvJs6.nCiJnjs2xw7C7fLKRQhKWMr9hn6JVdC', '555-0004', 'CLIENT', true, 1, NOW());

-- Technician profile for Tom
INSERT INTO technicians (user_id, specialization, availability, skill_tags)
VALUES (3, 'HVAC & Electrical', 'AVAILABLE', 'hvac,electrical,generator');

-- Sample parts inventory
INSERT INTO parts (name, sku, unit_cost, quantity_in_stock, reorder_threshold) VALUES
 ('HVAC Air Filter (20x25x1)', 'PRT-HVAC-001', 12.50, 40, 10),
 ('Elevator Drive Belt', 'PRT-ELEV-002', 145.00, 6, 2),
 ('Generator Spark Plug Set', 'PRT-GEN-003', 32.75, 15, 5);

-- Sample work order
INSERT INTO work_orders (ticket_number, title, description, client_id, site_id, asset_id, created_by, status, priority, created_at, sla_due_at, sla_breached)
VALUES ('WO-2026-00001', 'HVAC Unit not cooling - Floor 12', 'Tenants reporting warm air from vents on floor 12. Suspect compressor issue on RTU-3.', 1, 1, 1, 4, 'NEW', 'HIGH', NOW(), NOW() + INTERVAL '8 hours', false);
