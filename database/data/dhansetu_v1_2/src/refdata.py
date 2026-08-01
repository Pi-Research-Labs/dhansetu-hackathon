"""
DHANSETU synthetic panel — reference data.

Design decision: six districts across six states, chosen so that
(a) each district is a genuine centre for the industries assigned to it, and
(b) the six districts collectively cover exactly the six languages the
    product claims to support (gu, hi, te, mr, as, or).

Each district gets 42 enterprises -> 252 total, 6 officers x 42 caseload,
which matches the "42 units" caseload stated for the field-officer persona.
"""

SEED = 20260731

PANEL_START = "2023-08-01"
PANEL_END = "2026-07-31"  # 1096 days, 36 months, ends "today"

# ---------------------------------------------------------------- districts

DISTRICTS = [
    # id, district, state, lang, agro_zone, annual_rain_mm, cyclone_exposed
    (1, "Anand",     "Gujarat",     "gu", "Middle Gujarat Alluvial Plain",   840, False),
    (2, "Bhilwara",  "Rajasthan",   "hi", "Semi-Arid Eastern Rajasthan",     640, False),
    (3, "Nizamabad", "Telangana",   "te", "Northern Telangana Zone",        1030, False),
    (4, "Kolhapur",  "Maharashtra", "mr", "Western Maharashtra Ghat Zone",  1880, False),
    (5, "Nagaon",    "Assam",       "as", "Central Brahmaputra Valley",     1620, False),
    (6, "Ganjam",    "Odisha",      "or", "East Coastal Odisha",            1410, True),
]

# Monthly rainfall climatology (mm), Jan..Dec — shapes the climate stress term.
RAIN_CLIMATOLOGY = {
    1: [3, 1, 1, 2, 8, 120, 300, 260, 130, 15, 5, 2],       # Anand
    2: [6, 5, 3, 3, 12, 75, 210, 200, 95, 14, 4, 3],        # Bhilwara
    3: [6, 8, 12, 22, 40, 160, 290, 260, 180, 95, 22, 6],   # Nizamabad
    4: [3, 2, 5, 22, 70, 490, 620, 380, 200, 105, 35, 8],   # Kolhapur
    5: [14, 26, 62, 165, 250, 320, 330, 260, 190, 95, 14, 6],  # Nagaon
    6: [10, 22, 18, 32, 70, 190, 300, 290, 240, 180, 45, 8],   # Ganjam
}

# Monthly mean daily max temperature (C), Jan..Dec — drives the dairy heat term.
TEMP_CLIMATOLOGY = {
    1: [29, 32, 36, 39, 41, 37, 33, 32, 34, 36, 33, 30],
    2: [25, 28, 33, 38, 41, 40, 35, 33, 34, 34, 30, 26],
    3: [30, 33, 37, 40, 42, 37, 32, 31, 32, 32, 30, 29],
    4: [30, 32, 35, 37, 36, 30, 27, 27, 29, 31, 30, 29],
    5: [24, 27, 30, 31, 32, 32, 32, 32, 32, 31, 28, 25],
    6: [28, 31, 34, 36, 37, 35, 32, 32, 33, 33, 30, 28],
}

# ------------------------------------------------------------------ sectors
# Five sectors = five distinct cash-flow physics (the failure-mode taxonomy).
# Eight sub-types = the business types actually encountered in the field.
# Both are kept: sector drives the model, sub_type drives the UI copy.

SECTORS = [
    ("DAIRY",      "Dairy",                     "the slow squeeze — heat cuts yield as fodder cost peaks"),
    ("POULTRY",    "Poultry",                   "the cliff edge — 42-day batches, festival demand collapse"),
    ("HANDICRAFT", "Handicrafts & handloom",    "buyer risk — one delayed exporter is existential"),
    ("FOODPROC",   "Food processing & agri-aggregation", "receivables — 45-60 day retailer credit locks working capital"),
    ("RETAIL",     "Rural retail",              "silent udhaar — village credit sales quietly become receivables"),
]

SUB_TYPES = [
    # sub_type_id, label, sector, typical daily turnover (INR), local label key
    ("ST01", "Dairy Producer",            "DAIRY",      1400),
    ("ST02", "Poultry Unit (broiler)",    "POULTRY",    3200),
    ("ST03", "Handloom Weaver",           "HANDICRAFT",  900),
    ("ST04", "Pottery / Terracotta Unit", "HANDICRAFT",  650),
    ("ST05", "Tailoring Unit",            "HANDICRAFT",  750),
    ("ST06", "FPO / Agri Aggregator",     "FOODPROC",   6500),
    ("ST07", "SHG Food Processing Unit",  "FOODPROC",   2100),
    ("ST08", "Kirana Store",              "RETAIL",     4200),
    ("ST09", "Vegetable Vendor",          "RETAIL",     2600),
]

# Sector mix per district: reflects what each district is actually known for.
# Each row sums to 42.
DISTRICT_MIX = {
    1: {"ST01": 18, "ST08": 7, "ST09": 3, "ST06": 5, "ST07": 3, "ST03": 2, "ST05": 2, "ST02": 2},
    2: {"ST03": 10, "ST04": 6, "ST05": 4, "ST08": 6, "ST09": 4, "ST01": 6, "ST06": 2, "ST07": 2, "ST02": 2},
    3: {"ST02": 14, "ST06": 8, "ST07": 4, "ST08": 6, "ST09": 4, "ST01": 4, "ST03": 2},
    4: {"ST01": 14, "ST06": 7, "ST07": 5, "ST08": 6, "ST09": 4, "ST03": 2, "ST05": 2, "ST02": 2},
    5: {"ST07": 9, "ST06": 5, "ST03": 8, "ST05": 4, "ST08": 6, "ST09": 4, "ST02": 4, "ST01": 2},
    6: {"ST04": 8, "ST03": 6, "ST08": 8, "ST09": 4, "ST07": 5, "ST06": 3, "ST02": 6, "ST01": 2},
}

# --------------------------------------------------------- sector seasonality
# Month-of-year multipliers, Jan..Dec. Separate curves for inflow and outflow:
# the dairy squeeze only exists because the two curves move in opposite
# directions in Apr-Jun. A single shared seasonal curve cannot express it.

SEASONALITY_INFLOW = {
    "DAIRY":      [1.12, 1.06, 0.97, 0.84, 0.76, 0.78, 0.86, 0.92, 0.97, 1.12, 1.20, 1.18],
    "POULTRY":    [1.14, 1.10, 1.04, 1.00, 0.96, 0.92, 0.80, 0.79, 0.84, 0.96, 1.10, 1.15],
    "HANDICRAFT": [1.00, 0.95, 0.85, 0.72, 0.70, 0.75, 0.85, 1.05, 1.25, 1.35, 1.20, 1.05],
    "FOODPROC":   [0.95, 1.05, 1.25, 1.30, 1.05, 0.85, 0.80, 0.82, 0.90, 1.20, 1.30, 1.10],
    "RETAIL":     [1.08, 1.00, 0.98, 0.97, 0.95, 0.90, 0.88, 0.92, 1.02, 1.25, 1.18, 1.05],
}

SEASONALITY_OUTFLOW = {
    "DAIRY":      [0.92, 0.95, 1.05, 1.20, 1.28, 1.22, 1.05, 0.95, 0.92, 0.90, 0.90, 0.90],
    "POULTRY":    [1.00, 1.00, 1.02, 1.06, 1.10, 1.08, 1.02, 1.00, 1.00, 1.00, 1.00, 1.00],
    "HANDICRAFT": [1.00, 0.98, 0.95, 0.92, 0.92, 0.98, 1.10, 1.18, 1.20, 1.05, 0.98, 0.96],
    "FOODPROC":   [0.98, 1.08, 1.28, 1.30, 1.02, 0.85, 0.82, 0.85, 0.95, 1.25, 1.28, 1.05],
    "RETAIL":     [1.05, 1.00, 0.98, 0.97, 0.96, 0.92, 0.92, 0.98, 1.10, 1.22, 1.12, 1.02],
}

# ---------------------------------------------------------------- commodities
# Keyed by (commodity_id, district_id, date) in the output — NOT by persona.
# Prices belong to places and goods, not to borrower types.

COMMODITIES = [
    # id, name, unit, base_price, annual_trend_pct, seasonal_peak_month, amplitude
    ("CM01", "Milk procurement price",        "INR/litre", 36.0,  3.0,  11, 0.06),
    ("CM02", "Cattle feed / fodder index",    "index",    100.0,  5.5,   5, 0.14),
    ("CM03", "Broiler realisation price",     "INR/kg",   92.0,  4.0,  12, 0.16),
    ("CM04", "Poultry feed (maize-soya)",     "index",    100.0,  6.5,   6, 0.12),
    ("CM05", "Cotton yarn & fabric index",    "index",    100.0,  4.0,   9, 0.10),
    ("CM06", "Paddy & pulses mandi index",    "index",    100.0,  3.5,   4, 0.13),
    ("CM07", "Vegetable mandi basket",        "index",    100.0,  5.5,   7, 0.26),
    ("CM08", "FMCG & staples basket",         "index",    100.0,  4.0,  10, 0.05),
    ("CM09", "Diesel / transport index",      "index",    100.0,  5.0,   1, 0.07),
    ("CM10", "Clay, glaze & kiln fuel index", "index",    100.0,  5.0,   6, 0.09),
]

# Which commodity is the revenue driver and which the cost driver, per sector.
SECTOR_COMMODITIES = {
    "DAIRY":      {"revenue": "CM01", "cost": "CM02"},
    "POULTRY":    {"revenue": "CM03", "cost": "CM04"},
    "HANDICRAFT": {"revenue": "CM05", "cost": "CM05"},
    "FOODPROC":   {"revenue": "CM06", "cost": "CM06"},
    "RETAIL":     {"revenue": "CM08", "cost": "CM07"},
}

# ------------------------------------------------------------- receivables
# terms_days, share_of_sales_on_credit, counterparty concentration, bad-debt rate
RECEIVABLE_TERMS = {
    "DAIRY":      dict(terms=(8, 12),   credit_share=(0.90, 0.98), concentration=0.95, bad_debt=0.000),
    "POULTRY":    dict(terms=(0, 7),    credit_share=(0.55, 0.85), concentration=0.80, bad_debt=0.004),
    "HANDICRAFT": dict(terms=(55, 95),  credit_share=(0.65, 0.92), concentration=0.72, bad_debt=0.030),
    "FOODPROC":   dict(terms=(42, 62),  credit_share=(0.60, 0.85), concentration=0.55, bad_debt=0.018),
    "RETAIL":     dict(terms=(12, 75),  credit_share=(0.18, 0.42), concentration=0.10, bad_debt=0.075),
}

# --------------------------------------------------------------- shock events
# Every event is validated against a non-empty enterprise scope at build time.
SHOCK_EVENTS = [
    # code, type, start, days, districts, sectors, inflow_mult, outflow_mult, severity, desc
    ("EV01", "heatwave", "2024-05-04", 16, [1, 2], ["DAIRY"], 0.82, 1.09, "high",
     "Severe heat spell: milk yields fall while cooling and fodder costs rise"),
    ("EV02", "avian_influenza", "2024-12-08", 24, [3, 6], ["POULTRY"], 0.58, 0.94, "high",
     "Avian influenza scare: local broiler demand collapses for three weeks"),
    ("EV03", "mandi_strike", "2025-03-17", 7, [3, 4], ["FOODPROC", "RETAIL"], 0.47, 0.90, "medium",
     "Mandi logistics strike halts settlements and supply for a week"),
    ("EV04", "flood", "2025-07-11", 12, [5], ["DAIRY", "POULTRY", "HANDICRAFT", "FOODPROC", "RETAIL"],
     0.64, 1.02, "high", "Brahmaputra flooding disrupts operations and market access district-wide"),
    ("EV05", "export_order_cancellation", "2025-09-02", 45, [2, 5, 6], ["HANDICRAFT"], 0.55, 0.96, "high",
     "Overseas buyer cancels festival order book; receivables stretch sharply"),
    ("EV06", "fuel_spike", "2025-11-10", 34, [1, 2, 3, 4, 5, 6], ["FOODPROC", "RETAIL"], 1.00, 1.11, "medium",
     "Diesel price spike raises procurement and transport costs"),
    ("EV07", "cyclone", "2025-10-19", 6, [6], ["DAIRY", "POULTRY", "HANDICRAFT", "FOODPROC", "RETAIL"],
     0.72, 1.04, "high", "Cyclone landfall: precautionary closures and stock damage"),
    ("EV08", "heatwave", "2026-05-11", 19, [1, 2, 3], ["DAIRY", "POULTRY"], 0.80, 1.10, "high",
     "Prolonged heat spell: yield and laying rates fall, cooling costs rise"),
    ("EV09", "feed_price_shock", "2026-02-02", 60, [3, 5, 6], ["POULTRY"], 0.98, 1.16, "high",
     "Maize and soya shortage drives sustained feed cost escalation"),
    ("EV10", "milk_price_freeze", "2025-12-01", 150, [1, 4], ["DAIRY"], 0.99, 1.07, "high",
     "Co-operative holds procurement price flat through a fodder cost rise"),
]

# ---------------------------------------------------------------- schemes
SCHEMES = [
    ("SB01", "Dairy Entrepreneurship Development — interest subvention",
     ["DAIRY"], "emi_relief_pct", 0.20, "2024-11-01",
     "Interest subvention reduces effective EMI by ~20% for eligible dairy loans"),
    ("SB02", "Handloom yarn supply subsidy",
     ["HANDICRAFT"], "outflow_mult", 0.94, "2025-04-01",
     "Subsidised yarn under the National Handloom Development Programme lowers input cost ~6%"),
    ("SB03", "PMFME micro food-processing margin support",
     ["FOODPROC"], "inflow_mult", 1.05, "2025-01-01",
     "Branding and packaging support lifts realisation ~5%"),
    ("SB04", "FPO credit guarantee (SFAC)",
     ["FOODPROC"], "emi_relief_pct", 0.12, "2025-07-01",
     "Credit guarantee lowers borrowing cost; effective EMI ~12% lighter"),
    ("SB05", "National Livestock Mission — poultry support",
     ["POULTRY"], "outflow_mult", 0.96, "2025-10-01",
     "Feed and infrastructure support trims outflows ~4%"),
    ("SB06", "SHG revolving fund top-up (DAY-NRLM)",
     ["RETAIL", "HANDICRAFT"], "inflow_mult", 1.03, "2026-01-01",
     "Revolving fund allows larger stock cycles, lifting turnover ~3%"),
]

# ------------------------------------------------------------ named personas
# These are the enterprises the deck tells stories about. They are pinned to
# fixed IDs so every slide can name a row that actually exists.

NAMED_PERSONAS = [
    dict(
        enterprise_id="ENT0031", name="Lakshmiben Patel", age=38, sub_type="ST01",
        district_id=1, lang="gu", channel="app", shared_device=True,
        daily_turnover=1180, digital_start=0.34, digital_slope=0.10, literacy="low",
        stress_script="dairy_margin_squeeze",
        note="Dairy, Anand. Paid by the co-operative every 10 days. Shares a phone "
             "with her son. Cannot read English. Needs a 15-second daily habit.",
    ),
    dict(
        enterprise_id="ENT0104", name="Suresh Reddy", age=34, sub_type="ST02",
        district_id=3, lang="te", channel="app", shared_device=False,
        daily_turnover=3450, digital_start=0.62, digital_slope=0.06, literacy="numerate",
        stress_script="poultry_feed_shock",
        note="Broiler unit, Nizamabad. Nothing for 40 days, then a lump sum. Feed on "
             "dealer credit — his real lender. Needs a go / no-go before each batch.",
    ),
    dict(
        enterprise_id="ENT0067", name="Sunita Devi", age=52, sub_type="ST04",
        district_id=2, lang="hi", channel="ivr", shared_device=False,
        daily_turnover=520, digital_start=0.05, digital_slope=0.01, literacy="low",
        stress_script="handicraft_buyer_default",
        note="Pottery, Bhilwara. Feature phone only, low literacy. Reachable by IVR "
             "call or assisted entry alone. Needs a voice call, not an app.",
    ),
    dict(
        enterprise_id="ENT0152", name="Vaishali Patil", age=41, sub_type="ST07",
        district_id=4, lang="mr", channel="app", shared_device=False,
        daily_turnover=2250, digital_start=0.55, digital_slope=0.09, literacy="medium",
        stress_script="foodproc_receivable_stretch",
        note="SHG jaggery processing unit, Kolhapur. Sells to district retailers on "
             "45-day credit. Marathi voice entry.",
    ),
    dict(
        enterprise_id="ENT0188", name="Nilima Bora", age=36, sub_type="ST03",
        district_id=5, lang="as", channel="app", shared_device=True,
        daily_turnover=780, digital_start=0.28, digital_slope=0.08, literacy="medium",
        stress_script="handicraft_buyer_default",
        note="Handloom weaver, Nagaon. Export order book through a single Guwahati "
             "agent. Flood-exposed. Assamese voice entry.",
    ),
    dict(
        enterprise_id="ENT0224", name="Basanti Pradhan", age=47, sub_type="ST08",
        district_id=6, lang="or", channel="assisted", shared_device=False,
        daily_turnover=3600, digital_start=0.11, digital_slope=0.03, literacy="low",
        stress_script="retail_udhaar_spiral",
        note="Kirana store, Ganjam. Heavy village udhaar book, cash-dominant, "
             "cyclone-exposed. Odia, assisted entry by an e-Shakti animator.",
    ),
]

OFFICERS = [
    ("FO1", "Prakash Nair",       29, 1, "gu", "Anand"),
    ("FO2", "Meena Choudhary",    35, 2, "hi", "Bhilwara"),
    ("FO3", "K. Ramesh",          41, 3, "te", "Nizamabad"),
    ("FO4", "Sujata Kulkarni",    33, 4, "mr", "Kolhapur"),
    ("FO5", "Dhruba Saikia",      38, 5, "as", "Nagaon"),
    ("FO6", "Sanjay Behera",      44, 6, "or", "Berhampur"),
]

# Six named stress mechanisms — the rule engine and reason codes both use
# exactly this vocabulary, so a flag always maps to a mechanism.
MECHANISMS = [
    "margin_squeeze",
    "climate_shock",
    "debt_overhang",
    "receivable_stretch",
    "demand_trough",
    "working_capital_erosion",
]

# Action vocabulary is deliberately DISTINCT from the mechanism vocabulary:
# a recommendation must be an action, not a restatement of the problem.
ACTIONS = [
    ("AC01", "request_bridge_loan",      "Request a {days}-day SHG bridge loan of about Rs {amount} now, before the shortfall week"),
    ("AC02", "defer_capex",              "Defer the planned Rs {amount} equipment purchase by one quarter"),
    ("AC03", "prebook_input",            "Pre-book {months} months of {input_name} at today's price before the seasonal rise"),
    ("AC04", "renegotiate_buyer_terms",  "Ask {buyer} to move from {old_days}-day to {new_days}-day payment terms"),
    ("AC05", "diversify_buyer",          "Add a second buyer — {buyer} is {pct}% of your sales"),
    ("AC06", "collect_udhaar",           "Collect Rs {amount} of village credit older than {days} days"),
    ("AC07", "stagger_batch",            "Delay the next batch placement by {days} days to clear the demand trough"),
    ("AC08", "restructure_emi",          "Ask the branch to reschedule the EMI to a {months}-month longer tenor"),
    ("AC09", "claim_scheme",             "You are eligible for {scheme} — apply through your {channel}"),
    ("AC10", "reduce_drawings",          "Hold household drawings to Rs {amount} for the next {months} months"),
    ("AC11", "sell_slow_stock",          "Clear Rs {amount} of stock held longer than {days} days"),
    ("AC12", "on_track",                 "No action needed — your cash position is on track for the next {months} months"),
]
