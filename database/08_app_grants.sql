-- DHANSETU — baseline grants for the app's database role.
-- Hand-written. Run AFTER 07_auth.sql (needs merchant_accounts to exist).
--
-- The hackathon decision was NOT to restrict dhansetu_user to safe views only
-- (that would need per-role grants on views alone, relying on Postgres running
-- views with the view owner's privileges). Instead the backend is trusted to
-- only query views/functions listed in database/README.md. This script just
-- gives dhansetu_user the baseline access it needs to function at all —
-- without it, the role has database-level CONNECT/CREATE but literally no
-- privileges inside the dhansetu schema (this is what broke /auth/login).
GRANT USAGE ON SCHEMA dhansetu TO dhansetu_user;
GRANT SELECT ON ALL TABLES IN SCHEMA dhansetu TO dhansetu_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dhansetu TO dhansetu_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA dhansetu TO dhansetu_user;

-- Write access limited to the live-capture / app-owned tables.
GRANT INSERT, UPDATE ON dhansetu.merchant_accounts TO dhansetu_user;
GRANT INSERT ON dhansetu.voice_entries, dhansetu.voice_extractions TO dhansetu_user;
GRANT UPDATE (reviewed_by, reviewed_amount) ON dhansetu.voice_extractions TO dhansetu_user;
GRANT INSERT ON dhansetu.ledger_entries_live TO dhansetu_user;
GRANT INSERT, UPDATE ON dhansetu.mandi_prices_live, dhansetu.weather_live TO dhansetu_user;
GRANT INSERT, UPDATE ON dhansetu.ingestion_runs TO dhansetu_user;

-- So future tables created the same way don't repeat this bug.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA dhansetu
  GRANT SELECT ON TABLES TO dhansetu_user;
