-- DHANSETU v1.2 — live data layer.
-- Real inputs (voice, prices, weather) alongside the synthetic panel.
-- Run AFTER 03_constraints_indexes.sql and BEFORE 05_views.sql.
SET search_path TO dhansetu, public;

-- ===========================================================================
-- 1. Real district centroids — needed for Open-Meteo calls and route ordering.
-- Approximate district HQ coordinates; replace with surveyed values if you have them.
-- ===========================================================================

DROP TABLE IF EXISTS district_geo CASCADE;
CREATE TABLE district_geo (
    district_id  INTEGER PRIMARY KEY REFERENCES districts(district_id),
    lat          DOUBLE PRECISION NOT NULL,
    lon          DOUBLE PRECISION NOT NULL,
    agmarknet_state    TEXT NOT NULL,
    agmarknet_district TEXT NOT NULL
);

INSERT INTO district_geo VALUES
  (1, 22.5645, 72.9289, 'Gujarat',     'Anand'),
  (2, 25.3407, 74.6313, 'Rajasthan',   'Bhilwara'),
  (3, 18.6725, 78.0941, 'Telangana',   'Nizamabad'),
  (4, 16.7050, 74.2433, 'Maharashtra', 'Kolhapur'),
  (5, 26.3464, 92.6840, 'Assam',       'Nagaon'),
  (6, 19.3150, 84.7941, 'Odisha',      'Ganjam');

-- ===========================================================================
-- 2. Commodity mapping: your CM ids <-> real Agmarknet commodity names.
-- This mapping is the actual integration work. Note which rows have NO
-- Agmarknet equivalent — milk procurement price is co-operative-administered
-- and is not published on Agmarknet at all, which is precisely why the margin
-- squeeze goes unnoticed.
-- ===========================================================================

DROP TABLE IF EXISTS commodity_map CASCADE;
CREATE TABLE commodity_map (
    commodity_id       TEXT PRIMARY KEY REFERENCES commodities(commodity_id),
    agmarknet_names    TEXT[],          -- NULL = not available on Agmarknet
    proxy_note         TEXT,
    is_cost_driver     BOOLEAN NOT NULL DEFAULT FALSE,
    is_revenue_driver  BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO commodity_map VALUES
  ('CM01', NULL, 'Milk procurement price is co-op administered — scrape Amul/DCS published rates, not Agmarknet', FALSE, TRUE),
  ('CM02', ARRAY['Maize','Jowar(Sorghum)','Bajra(Pearl Millet/Cumbu)'], 'Fodder proxy basket', TRUE, FALSE),
  ('CM03', NULL, 'Broiler live-bird rate — use NECC / state poultry federation daily rates', FALSE, TRUE),
  ('CM04', ARRAY['Maize','Soyabean'], 'Poultry feed proxy: maize + soya', TRUE, FALSE),
  ('CM05', ARRAY['Cotton'], 'Yarn proxy via raw cotton', TRUE, TRUE),
  ('CM06', ARRAY['Paddy(Dhan)(Common)','Bengal Gram(Gram)(Whole)','Arhar (Tur/Red Gram)(Whole)'], 'Agri aggregation basket', TRUE, TRUE),
  ('CM07', ARRAY['Onion','Potato','Tomato','Brinjal','Cabbage'], 'Vegetable basket', TRUE, TRUE),
  ('CM08', NULL, 'FMCG staples — no Agmarknet series; use CPI rural food index', TRUE, FALSE),
  ('CM09', NULL, 'Diesel — use state retail fuel price feed', TRUE, FALSE),
  ('CM10', NULL, 'Clay/kiln fuel — no public series; treat as unobserved', TRUE, FALSE);

-- ===========================================================================
-- 3. Agmarknet ingestion (data.gov.in resource -> raw, then normalised)
-- ===========================================================================

DROP TABLE IF EXISTS mandi_prices_live CASCADE;
CREATE TABLE mandi_prices_live (
    id             BIGSERIAL PRIMARY KEY,
    arrival_date   DATE    NOT NULL,
    state          TEXT    NOT NULL,
    district       TEXT    NOT NULL,
    market         TEXT,
    commodity      TEXT    NOT NULL,
    variety        TEXT,
    grade          TEXT,
    min_price      NUMERIC(12,2),
    max_price      NUMERIC(12,2),
    modal_price    NUMERIC(12,2),
    -- resolved against district_geo / commodity_map; NULL when unmatched
    district_id    INTEGER REFERENCES districts(district_id),
    commodity_id   TEXT    REFERENCES commodities(commodity_id),
    fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw            JSONB,
    UNIQUE (arrival_date, state, district, market, commodity, variety)
);
CREATE INDEX ix_mpl_lookup ON mandi_prices_live (commodity_id, district_id, arrival_date DESC);

-- One series the models can read, whichever source it came from.
CREATE OR REPLACE VIEW v_price_series AS
SELECT commodity_id, district_id, price_date, modal_price, 'synthetic'::text AS provenance
FROM mandi_prices
UNION ALL
SELECT commodity_id, district_id, arrival_date, AVG(modal_price), 'agmarknet'
FROM mandi_prices_live
WHERE commodity_id IS NOT NULL AND district_id IS NOT NULL
GROUP BY commodity_id, district_id, arrival_date;

-- ===========================================================================
-- 4. Open-Meteo ingestion, with the THI recomputed from real observations
-- ===========================================================================

DROP TABLE IF EXISTS weather_live CASCADE;
CREATE TABLE weather_live (
    district_id   INTEGER NOT NULL REFERENCES districts(district_id),
    obs_date      DATE    NOT NULL,
    rainfall_mm   NUMERIC(8,2),
    temp_max_c    NUMERIC(5,2),
    temp_min_c    NUMERIC(5,2),
    humidity_pct  NUMERIC(5,2),
    -- Temperature-humidity index: above ~78 dairy yield measurably declines.
    thi           NUMERIC(6,2) GENERATED ALWAYS AS (
                      0.8 * temp_max_c + (humidity_pct / 100.0) * (temp_max_c - 14.4) + 46.4
                  ) STORED,
    is_forecast   BOOLEAN NOT NULL DEFAULT FALSE,
    fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (district_id, obs_date, is_forecast)
);

CREATE OR REPLACE VIEW v_weather_series AS
SELECT district_id, obs_date, rainfall_mm, temp_max_c, humidity_pct, thi,
       'synthetic'::text AS provenance, FALSE AS is_forecast
FROM weather_daily
UNION ALL
SELECT district_id, obs_date, rainfall_mm, temp_max_c, humidity_pct, thi,
       'open_meteo', is_forecast
FROM weather_live;

-- ===========================================================================
-- 5. SARVAM VOICE CAPTURE
-- Transcription and extraction are separate tables on purpose: you will want
-- to re-run extraction against a better prompt without paying to re-transcribe.
-- ===========================================================================

DROP TABLE IF EXISTS voice_extractions CASCADE;
DROP TABLE IF EXISTS voice_entries CASCADE;

CREATE TABLE voice_entries (
    voice_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id     TEXT REFERENCES enterprises(enterprise_id),
    -- captured on device, so the id is client-generatable and the row is append-only
    device_id         TEXT,
    spoken_at         TIMESTAMPTZ NOT NULL,
    received_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    sync_lag_seconds  INTEGER GENERATED ALWAYS AS
                        (EXTRACT(EPOCH FROM (received_at - spoken_at))::int) STORED,
    audio_path        TEXT,
    audio_seconds     NUMERIC(6,2),
    audio_sample_rate INTEGER,          -- 8000 for IVR/telephony, 16000 for app
    channel           TEXT NOT NULL CHECK (channel IN ('app','ivr','assisted')),
    -- Sarvam response
    sarvam_model      TEXT    NOT NULL DEFAULT 'saaras:v3',
    sarvam_mode       TEXT    NOT NULL DEFAULT 'codemix'
                       CHECK (sarvam_mode IN ('transcribe','translate','verbatim','translit','codemix')),
    requested_lang    TEXT,              -- NULL / 'unknown' triggers auto-detect
    detected_lang     TEXT,              -- e.g. gu-IN
    language_probability NUMERIC(5,4),   -- Sarvam's own confidence
    transcript        TEXT,
    diarised_speaker  TEXT,              -- shared-device case: her vs her son
    request_id        TEXT,
    api_latency_ms    INTEGER,
    error             TEXT
);
CREATE INDEX ix_voice_ent ON voice_entries (enterprise_id, spoken_at DESC);
CREATE INDEX ix_voice_lowconf ON voice_entries (language_probability)
    WHERE language_probability < 0.75;

COMMENT ON COLUMN voice_entries.language_probability IS
  'Sarvam auto-detect confidence. Feeds data_completeness — low confidence should widen the band, not be silently trusted.';

CREATE TABLE voice_extractions (
    extraction_id   BIGSERIAL PRIMARY KEY,
    voice_id        UUID NOT NULL REFERENCES voice_entries(voice_id) ON DELETE CASCADE,
    extractor       TEXT NOT NULL,          -- model/prompt version
    extracted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount          NUMERIC(14,2),
    direction       TEXT CHECK (direction IN ('inflow','outflow')),
    category        TEXT,                   -- milk_sale, feed, fees, udhaar_given...
    counterparty    TEXT,
    is_household    BOOLEAN DEFAULT FALSE,
    confidence      NUMERIC(5,4),
    -- Spoken Indian-language amounts are the top failure mode. Anything the
    -- extractor is unsure about goes to a human instead of into the ledger.
    needs_review    BOOLEAN GENERATED ALWAYS AS
                      (amount IS NULL OR confidence < 0.70) STORED,
    reviewed_by     TEXT,
    reviewed_amount NUMERIC(14,2),
    raw_response    JSONB
);
CREATE INDEX ix_vx_review ON voice_extractions (needs_review) WHERE needs_review;

-- Append-only real ledger. Corrections are new rows, never UPDATEs.
DROP TABLE IF EXISTS ledger_entries_live CASCADE;
CREATE TABLE ledger_entries_live (
    entry_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id   TEXT NOT NULL REFERENCES enterprises(enterprise_id),
    event_date      DATE NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL,
    direction       TEXT NOT NULL CHECK (direction IN ('inflow','outflow')),
    amount          NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    category        TEXT NOT NULL,
    tender          TEXT CHECK (tender IN ('cash','upi','wallet','bank','credit')),
    is_household    BOOLEAN NOT NULL DEFAULT FALSE,
    source          TEXT NOT NULL CHECK (source IN ('voice','ivr','assisted','manual','upi_feed')),
    voice_id        UUID REFERENCES voice_entries(voice_id),
    confidence      NUMERIC(5,4),
    corrects_entry  UUID REFERENCES ledger_entries_live(entry_id),
    voided          BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX ix_lel ON ledger_entries_live (enterprise_id, event_date) WHERE NOT voided;

-- Effective ledger: latest correction wins, voids excluded.
CREATE OR REPLACE VIEW v_ledger_live_effective AS
WITH corrected AS (
    SELECT DISTINCT corrects_entry FROM ledger_entries_live WHERE corrects_entry IS NOT NULL
)
SELECT l.* FROM ledger_entries_live l
LEFT JOIN corrected c ON c.corrects_entry = l.entry_id
WHERE NOT l.voided AND c.corrects_entry IS NULL;

-- Daily roll-up in the same shape as daily_ledger, so the existing pipeline
-- can consume real data with no code change.
CREATE OR REPLACE VIEW v_daily_from_voice AS
SELECT enterprise_id, event_date,
       SUM(amount) FILTER (WHERE direction = 'inflow')                          AS cash_inflow,
       SUM(amount) FILTER (WHERE direction = 'outflow')                         AS outflow,
       SUM(amount) FILTER (WHERE direction = 'outflow' AND NOT is_household)    AS input_cost,
       SUM(amount) FILTER (WHERE direction = 'outflow' AND is_household)        AS household_drawings,
       COALESCE(SUM(amount) FILTER (WHERE direction='inflow'),0)
         - COALESCE(SUM(amount) FILTER (WHERE direction='outflow'),0)           AS net,
       COUNT(*)                                                                 AS txn_count,
       ROUND(AVG(confidence)::numeric, 3)                                       AS mean_confidence
FROM v_ledger_live_effective
GROUP BY enterprise_id, event_date;

-- What a human still has to check.
CREATE OR REPLACE VIEW v_voice_review_queue AS
SELECT v.voice_id, v.enterprise_id, e.proprietor_name, e.preferred_lang,
       v.spoken_at, v.channel, v.detected_lang, v.language_probability,
       v.transcript, x.amount, x.direction, x.category, x.confidence
FROM voice_entries v
JOIN voice_extractions x USING (voice_id)
LEFT JOIN enterprises e USING (enterprise_id)
WHERE x.needs_review AND x.reviewed_by IS NULL
ORDER BY v.spoken_at DESC;

-- ===========================================================================
-- 6. Ingestion log — you will need this the moment a demo breaks
-- ===========================================================================

DROP TABLE IF EXISTS ingestion_runs CASCADE;
CREATE TABLE ingestion_runs (
    run_id       BIGSERIAL PRIMARY KEY,
    source       TEXT NOT NULL,          -- agmarknet | open_meteo | sarvam_stt
    started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at  TIMESTAMPTZ,
    params       JSONB,
    rows_fetched INTEGER,
    rows_upserted INTEGER,
    rows_unmatched INTEGER,             -- e.g. Agmarknet commodity we could not map
    http_status  INTEGER,
    ok           BOOLEAN,
    error        TEXT
);

-- ===========================================================================
-- 7. Observability: how much of the panel is real vs simulated, per enterprise
-- ===========================================================================

CREATE OR REPLACE VIEW v_data_provenance AS
SELECT e.enterprise_id, e.proprietor_name, e.preferred_channel,
       (SELECT COUNT(*) FROM daily_ledger d WHERE d.enterprise_id = e.enterprise_id)
         AS synthetic_ledger_days,
       (SELECT COUNT(DISTINCT event_date) FROM v_ledger_live_effective l
         WHERE l.enterprise_id = e.enterprise_id) AS real_ledger_days,
       (SELECT COUNT(*) FROM voice_entries v WHERE v.enterprise_id = e.enterprise_id)
         AS voice_captures,
       (SELECT ROUND(AVG(language_probability)::numeric,3) FROM voice_entries v
         WHERE v.enterprise_id = e.enterprise_id) AS mean_asr_confidence
FROM enterprises e;
