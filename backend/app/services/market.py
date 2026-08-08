from app.core.db import get_pool

# Metadata per sub_type category
CATEGORY_METADATA = {
    "Dairy Producer": {
        "tracked_commodity": "Milk procurement price (per litre)",
        "price_trend_12m_pct": -7.1,
        "productivity_outlook": "Per-animal yields trending +1.5% y/y with better feed; flush season output up strongly.",
        "seasonal_pattern": "Flush season (Nov-Feb) lifts volumes ~20%; lean summer months raise feed cost per litre.",
        "chart_data": [
          {"month": "Aug", "price_index": 104.5, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 100.2, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 96.8, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 96.4, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 95.8, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 97.5, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 98.4, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 100.1, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 100.5, "rainfall_mm": 45},
          {"month": "May", "price_index": 101.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 100.8, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 97.2, "rainfall_mm": 190},
        ],
    },
    "Poultry Unit (broiler)": {
        "tracked_commodity": "Broiler live-bird rate (per kg)",
        "price_trend_12m_pct": -4.2,
        "productivity_outlook": "42-day batch cycle; feed efficiency ratio (FCR) stable at 1.55.",
        "seasonal_pattern": "Shrawan and Navratri collapse local demand by 30-40%; post-festival surge in Q4.",
        "chart_data": [
          {"month": "Aug", "price_index": 92.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 94.5, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 102.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 108.5, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 112.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 105.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 99.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 98.5, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 96.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 91.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 88.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 89.5, "rainfall_mm": 190},
        ],
    },
    "Handloom Weaver": {
        "tracked_commodity": "Cotton yarn & fabric index",
        "price_trend_12m_pct": 4.0,
        "productivity_outlook": "Export orders up +3% y/y; weaver productivity steady at 4.2m/day.",
        "seasonal_pattern": "Apr-Jun trough before festival order cycle; peak fulfillment Sep-Nov.",
        "chart_data": [
          {"month": "Aug", "price_index": 98.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 101.2, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 106.5, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 108.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 104.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 100.5, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 99.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 97.5, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 96.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 96.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 97.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 97.5, "rainfall_mm": 190},
        ],
    },
    "Pottery / Terracotta Unit": {
        "tracked_commodity": "Clay, glaze & kiln fuel index",
        "price_trend_12m_pct": 5.0,
        "productivity_outlook": "Diwali/Dhanteras order accumulation on track; fuel costs +5% y/y.",
        "seasonal_pattern": "Dry winter & summer months enable high kiln firing; monsoon halts production.",
        "chart_data": [
          {"month": "Aug", "price_index": 95.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 98.0, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 109.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 110.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 101.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 99.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 100.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 101.5, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 103.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 104.0, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 96.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 94.0, "rainfall_mm": 190},
        ],
    },
    "Tailoring Unit": {
        "tracked_commodity": "Fabric & thread price index",
        "price_trend_12m_pct": 3.8,
        "productivity_outlook": "School uniform & wedding season orders steady; sewing machine utilization 82%.",
        "seasonal_pattern": "Peak demand during wedding months (Nov-Feb) and school reopenings (Jun-Jul).",
        "chart_data": [
          {"month": "Aug", "price_index": 99.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 101.0, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 105.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 107.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 106.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 104.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 103.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 100.0, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 98.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 102.0, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 106.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 104.0, "rainfall_mm": 190},
        ],
    },
    "FPO / Agri Aggregator": {
        "tracked_commodity": "Paddy & pulses mandi index",
        "price_trend_12m_pct": 3.5,
        "productivity_outlook": "Procurement volumes +5% y/y; processing margin compressed by transport fuel costs.",
        "seasonal_pattern": "Harvest arrival surge Oct-Dec; lean stocking period May-Jul.",
        "chart_data": [
          {"month": "Aug", "price_index": 98.5, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 99.0, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 106.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 109.5, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 107.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 103.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 101.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 100.0, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 99.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 97.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 98.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 98.2, "rainfall_mm": 190},
        ],
    },
    "SHG Food Processing Unit": {
        "tracked_commodity": "Spices & grain processing index",
        "price_trend_12m_pct": 4.8,
        "productivity_outlook": "Government institutional catering contracts active; packaging costs up +6%.",
        "seasonal_pattern": "Post-harvest processing peak Nov-Mar; summer drying season for spices.",
        "chart_data": [
          {"month": "Aug", "price_index": 97.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 99.5, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 104.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 108.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 106.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 104.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 103.5, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 102.0, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 100.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 98.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 97.5, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 97.0, "rainfall_mm": 190},
        ],
    },
    "Kirana Store": {
        "tracked_commodity": "FMCG & staples basket",
        "price_trend_12m_pct": 5.5,
        "productivity_outlook": "Daily store footfall steady; digital payment adoption up 14%.",
        "seasonal_pattern": "Diwali/Dussehra festival surge lifts monthly turnover ~35%; monsoon dip in Jul-Aug.",
        "chart_data": [
          {"month": "Aug", "price_index": 96.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 99.0, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 108.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 110.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 105.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 102.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 101.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 100.5, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 100.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 99.5, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 98.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 96.5, "rainfall_mm": 190},
        ],
    },
    "Vegetable Vendor": {
        "tracked_commodity": "Vegetable mandi basket",
        "price_trend_12m_pct": 8.2,
        "productivity_outlook": "Perishable loss rate at 6%; morning mandi wholesale prices volatile.",
        "seasonal_pattern": "Winter supply abundance lowers wholesale prices; summer heat increases wastage.",
        "chart_data": [
          {"month": "Aug", "price_index": 112.0, "rainfall_mm": 380},
          {"month": "Sep", "price_index": 105.0, "rainfall_mm": 200},
          {"month": "Oct", "price_index": 98.0, "rainfall_mm": 75},
          {"month": "Nov", "price_index": 94.0, "rainfall_mm": 10},
          {"month": "Dec", "price_index": 90.0, "rainfall_mm": 0},
          {"month": "Jan", "price_index": 88.0, "rainfall_mm": 0},
          {"month": "Feb", "price_index": 92.0, "rainfall_mm": 15},
          {"month": "Mar", "price_index": 96.0, "rainfall_mm": 25},
          {"month": "Apr", "price_index": 102.0, "rainfall_mm": 45},
          {"month": "May", "price_index": 108.0, "rainfall_mm": 95},
          {"month": "Jun", "price_index": 115.0, "rainfall_mm": 250},
          {"month": "Jul", "price_index": 114.0, "rainfall_mm": 190},
        ],
    },
}


async def get_market_categories(enterprise_id: str | None = None) -> list[dict]:
    merchant_sub_type_id = None
    if enterprise_id:
        try:
            pool = get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT sub_type_id FROM dhansetu.v_enterprises_safe WHERE enterprise_id = $1",
                    enterprise_id,
                )
                if row:
                    merchant_sub_type_id = row["sub_type_id"]
        except Exception:
            pass

    cats = []
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT sub_type_id, sub_type, sector, typical_daily_turnover FROM dhansetu.v_market_intelligence_categories"
            )
            if rows:
                cats = [dict(row) for row in rows]
    except Exception:
        pass
        
    if not cats:
        # Fallback if DB not loaded
        cats = [
            {"sub_type_id": "ST01", "sub_type": "Dairy Producer", "sector": "DAIRY", "typical_daily_turnover": 1400},
            {"sub_type_id": "ST02", "sub_type": "Poultry Unit (broiler)", "sector": "POULTRY", "typical_daily_turnover": 3200},
            {"sub_type_id": "ST03", "sub_type": "Handloom Weaver", "sector": "HANDICRAFT", "typical_daily_turnover": 900},
            {"sub_type_id": "ST04", "sub_type": "Pottery / Terracotta Unit", "sector": "HANDICRAFT", "typical_daily_turnover": 650},
            {"sub_type_id": "ST05", "sub_type": "Tailoring Unit", "sector": "HANDICRAFT", "typical_daily_turnover": 750},
            {"sub_type_id": "ST06", "sub_type": "FPO / Agri Aggregator", "sector": "FOODPROC", "typical_daily_turnover": 6500},
            {"sub_type_id": "ST07", "sub_type": "SHG Food Processing Unit", "sector": "FOODPROC", "typical_daily_turnover": 2100},
            {"sub_type_id": "ST08", "sub_type": "Kirana Store", "sector": "RETAIL", "typical_daily_turnover": 4200},
            {"sub_type_id": "ST09", "sub_type": "Vegetable Vendor", "sector": "RETAIL", "typical_daily_turnover": 2600},
        ]

    for c in cats:
        c["is_merchant_primary"] = (c["sub_type_id"] == merchant_sub_type_id)

    return cats


async def get_market_intelligence(sub_type_query: str | None = None, enterprise_id: str | None = None) -> dict:
    merchant_info = None
    if enterprise_id:
        try:
            pool = get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT enterprise_id, sub_type_id, sub_type, sector, district_id, district FROM dhansetu.v_enterprises_safe WHERE enterprise_id = $1",
                    enterprise_id,
                )
                if row:
                    merchant_info = dict(row)
        except Exception:
            pass

    categories = await get_market_categories(enterprise_id)
    
    # Match selected sub_type or merchant's primary sub_type or default to "Dairy Producer"
    selected = None
    if sub_type_query:
        query_norm = sub_type_query.strip().lower()
        for cat in categories:
            if cat["sub_type"].lower() == query_norm or cat["sub_type_id"].lower() == query_norm or cat["sector"].lower() == query_norm:
                selected = cat
                break
    elif merchant_info:
        for cat in categories:
            if cat["sub_type_id"] == merchant_info["sub_type_id"]:
                selected = cat
                break

    if not selected:
        selected = categories[0]
    
    sub_type_name = selected["sub_type"]
    sector_name = selected["sector"]
    sub_type_id = selected["sub_type_id"]
    district_name = merchant_info["district"] if merchant_info else None
    
    meta = None
    chart_data = []
    risks = []
    
    # Try querying live DB views
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            # 1. Detail view
            detail_row = await conn.fetchrow(
                "SELECT tracked_commodity, price_trend_12m_pct, productivity_outlook, seasonal_pattern FROM dhansetu.v_market_intelligence_detail WHERE sub_type_id = $1",
                sub_type_id,
            )
            if detail_row:
                meta = dict(detail_row)
                meta["price_trend_12m_pct"] = float(meta["price_trend_12m_pct"]) if meta["price_trend_12m_pct"] is not None else 4.0

            # 2. 12-month chart view
            chart_rows = await conn.fetch(
                "SELECT month, price_index, rainfall_mm FROM dhansetu.v_market_intelligence_chart WHERE sub_type_id = $1 ORDER BY month_num",
                sub_type_id,
            )
            if chart_rows:
                chart_data = [
                    {
                        "month": r["month"],
                        "price_index": float(r["price_index"]) if r["price_index"] is not None else 100.0,
                        "rainfall_mm": float(r["rainfall_mm"]) if r["rainfall_mm"] is not None else 0.0,
                    }
                    for r in chart_rows
                ]

            # 3. Risk cards view
            risk_rows = await conn.fetch(
                "SELECT risk_type, detail, severity FROM dhansetu.v_market_risk_cards WHERE sector = $1",
                sector_name,
            )
            if risk_rows:
                risks = [dict(r) for r in risk_rows]
    except Exception:
        pass
        
    # Fallbacks if DB query yields no results
    if not meta or not chart_data:
        fallback_meta = CATEGORY_METADATA.get(sub_type_name, CATEGORY_METADATA["Dairy Producer"])
        if not meta:
            meta = {
                "tracked_commodity": fallback_meta["tracked_commodity"],
                "price_trend_12m_pct": fallback_meta["price_trend_12m_pct"],
                "productivity_outlook": fallback_meta["productivity_outlook"],
                "seasonal_pattern": fallback_meta["seasonal_pattern"],
            }
        if not chart_data:
            chart_data = fallback_meta["chart_data"]

    if not risks:
        if sector_name == "DAIRY":
            risks = [
                {"risk_type": "Weather shock", "detail": "Heat stress in Apr-Jun cuts yields 8-12% in poor-rainfall years", "severity": "high"},
                {"risk_type": "Price fluctuation", "detail": "Feed (maize/soya) price spikes compress per-litre margin", "severity": "medium"},
            ]
        elif sector_name == "POULTRY":
            risks = [
                {"risk_type": "Demand cliff", "detail": "Festival demand collapse during Shrawan & Navratri", "severity": "high"},
                {"risk_type": "Disease risk", "detail": "Avian influenza scares halt sales district-wide", "severity": "high"},
            ]
        elif sector_name == "HANDICRAFT":
            risks = [
                {"risk_type": "Counterparty concentration", "detail": "Single exporter represents over 70% of order volume", "severity": "high"},
                {"risk_type": "Receivables delay", "detail": "55-95 day payment terms strain working capital", "severity": "medium"},
            ]
        elif sector_name == "FOODPROC":
            risks = [
                {"risk_type": "Working capital lockup", "detail": "42-62 day retailer credit locks liquidity", "severity": "high"},
                {"risk_type": "Logistics cost", "detail": "Mandi strikes & diesel fuel spikes hit margins", "severity": "medium"},
            ]
        else:
            risks = [
                {"risk_type": "Informal Udhaar", "detail": "Uncollected customer debt reaches ~7% write-off rate", "severity": "high"},
                {"risk_type": "Visibility gap", "detail": "Cash-dominant transactions understate true sales", "severity": "high"},
            ]

    return {
        "sub_type_id": sub_type_id,
        "sub_type": sub_type_name,
        "sector": sector_name,
        "enterprise_id": enterprise_id,
        "district": district_name,
        "tracked_commodity": meta["tracked_commodity"],
        "price_trend_12m_pct": meta["price_trend_12m_pct"],
        "productivity_outlook": meta["productivity_outlook"],
        "seasonal_pattern": meta["seasonal_pattern"],
        "chart_data": chart_data,
        "risks": risks,
    }

