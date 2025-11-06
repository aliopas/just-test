-- Seed data for development/testing

INSERT INTO users (email, phone, phone_cc, role, status)
VALUES ('seed@example.com', '555000111', '+966', 'investor', 'active')
ON CONFLICT (email) DO NOTHING;
