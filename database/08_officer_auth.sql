-- DHANSETU — field officer app login.
-- Hand-written (not generated). Run AFTER 05_views.sql, alongside 07_auth.sql.
-- Mirrors merchant_accounts: phone-number + password auth, same hackathon
-- caveats apply (see database/README.md — OTP would be the real design).
SET search_path TO dhansetu, public;

DROP TABLE IF EXISTS officer_accounts CASCADE;
CREATE TABLE officer_accounts (
    account_id      BIGSERIAL PRIMARY KEY,
    officer_id      TEXT NOT NULL REFERENCES officers(officer_id),
    phone_number    TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);
CREATE INDEX ix_officer_accounts_officer ON officer_accounts (officer_id);

COMMENT ON TABLE officer_accounts IS
  'App login for field officers. Demo-only passwords documented in
   database/README.md — never store real credentials this casually.';

-- Seed all 6 field officers. Plaintext passwords are documented in
-- database/README.md.
INSERT INTO officer_accounts (officer_id, phone_number, password_hash) VALUES
  ('FO1', '8000000001', '$2b$12$ZFDajhiruT7G.d5bTFARJe03wn6MBPCq1l5yTJ/BJwuvIdbFV8rxS'),
  ('FO2', '8000000002', '$2b$12$im27AHpwjH2P/PJxx.fgWuONx3KkHk45YXRk3tnrZ09HTFS/WsYP.'),
  ('FO3', '8000000003', '$2b$12$OoF7vhoE7IQqc7045J1/F.wAl6y6NcBSHtbURUlowZpinqdtf5cqy'),
  ('FO4', '8000000004', '$2b$12$4dijy7mh3ogJOf2wk7E3muPvOgT/PSzezuNWNTRsfOAhnllAkhNzO'),
  ('FO5', '8000000005', '$2b$12$MqyrfgT5PlKCU9F0fx1Qg./Hd5Aqvxe8INKdwJUCArh1m7HTgoIOu'),
  ('FO6', '8000000006', '$2b$12$5gAVs35U2uD.GXdHui3VfueCtSGbdUAMGBbgY89N4/V.sDuwYvp.S');
