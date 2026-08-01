-- DHANSETU — merchant app login.
-- Hand-written (not generated). Run AFTER 05_views.sql.
-- Adds phone-number + password auth so demo personas can log into the
-- mobile app. Real accounts should move to OTP given the target users
-- (shared devices, low digital literacy) — see database/README.md.
SET search_path TO dhansetu, public;

DROP TABLE IF EXISTS merchant_accounts CASCADE;
CREATE TABLE merchant_accounts (
    account_id      BIGSERIAL PRIMARY KEY,
    enterprise_id   TEXT NOT NULL REFERENCES enterprises(enterprise_id),
    phone_number    TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);
CREATE INDEX ix_merchant_accounts_enterprise ON merchant_accounts (enterprise_id);

COMMENT ON TABLE merchant_accounts IS
  'App login for merchants. Demo-only passwords below are bcrypt hashes of
   values documented in database/README.md — never store real merchant
   passwords this casually.';

-- Seed accounts for the six named demo personas (enterprises.is_named_persona).
-- Plaintext passwords are documented in database/README.md — these are
-- synthetic demo accounts, not real people.
INSERT INTO merchant_accounts (enterprise_id, phone_number, password_hash) VALUES
  ('ENT0031', '9000000031', '$2b$12$VyD/ayKrTkgwBppWkSdmZ.thuAhGT/8NzOGfoqcx2xR7/F/6ePBTW'),
  ('ENT0104', '9000000104', '$2b$12$udPafrz3CN1G27GZfBkqHue0YcGGUdlpkCb71oNyluXvlPguOiI/e'),
  ('ENT0067', '9000000067', '$2b$12$lVHY94amMTKdQxezpDWtZu1g6JGvn7eMINpBiKx0e65K69b16yGZm'),
  ('ENT0152', '9000000152', '$2b$12$63hNqPtnuBNAddQcShMvNegUGMUDknrqDOy5LsRmkFupCjg0u.4Ku'),
  ('ENT0188', '9000000188', '$2b$12$N5GNGGZRDHj3RbCNf7pDSOoWS7C2H0JqKT9T3/S1OlmBQLCTFJZh2'),
  ('ENT0224', '9000000224', '$2b$12$U4oBnIhOeiqPCly/Cj80x.gJWrt1i2OpyV4Rjfk.zLlgZsrg9Hzem');
