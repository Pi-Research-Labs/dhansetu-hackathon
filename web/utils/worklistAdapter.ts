import { WorklistItem, EnterpriseDetailsResponse, EnterpriseCard } from "./api-config";
import { Enterprise } from "@/types/enterprise";

/**
 * Converts a WorklistItem returned from GET /worklist into the Enterprise format
 * used by dashboard detail components.
 */
export function worklistItemToEnterprise(item: WorklistItem): Enterprise {
  const formattedScore = Math.round(item.score <= 1 ? item.score * 100 : item.score);
  const riskTier = (item.risk_tier as "AMBER" | "RED" | "GREEN") || "AMBER";

  const reasonsList = [item.reason_1, item.reason_2, item.reason_3]
    .filter((r): r is string => Boolean(r && r.trim()))
    .map((r) => ({
      key: r,
      tag: r.replace(/_/g, " ").toUpperCase(),
      detail: `Risk factor: ${r.replace(/_/g, " ")}`,
    }));

  return {
    id: item.enterprise_id,
    name: item.proprietor_name || `Enterprise ${item.enterprise_id}`,
    segment: item.sub_type || "General MSME",
    district: item.block || "District",
    phone: "+91 9876543210",
    tier: riskTier,
    score: formattedScore,
    confidence: { score: 85, label: item.low_visibility ? "Low" : "High" },
    forecastBand: [
      [25000, 55000],
      [20000, 48000],
      [15000, 42000],
      [10000, 35000],
      [8000, 30000],
      [5000, 25000],
    ],
    reasons:
      reasonsList.length > 0
        ? reasonsList
        : [
            {
              key: "buffer_stress",
              tag: "Buffer Stress",
              detail: `${item.net_buffer_days} days of net buffer remaining`,
            },
          ],
    adviceKeys: reasonsList.map((r) => r.key),
    forecast90: item.projected_shortfall || item.rupees_at_risk,
    forecast180: (item.projected_shortfall || item.rupees_at_risk) * 1.5,
    netNow90: -item.rupees_at_risk,
    monthlyForecast: [
      Math.round((item.projected_shortfall || item.rupees_at_risk) / 3),
      Math.round((item.projected_shortfall || item.rupees_at_risk) / 3),
      Math.round((item.projected_shortfall || item.rupees_at_risk) / 3),
      15000,
      12000,
      10000,
    ],
    metrics: {
      avgInflow30: 45000,
      outInRatio: 1.15,
      zeroDays: Math.abs(Math.min(0, item.net_buffer_days)),
      volatility: 0.45,
      trend: -0.12,
      savings: item.bridge_headroom,
      runwayMonths: Math.max(0, Math.round(((item.net_buffer_days + 30) / 30) * 10) / 10),
      missedEmi: item.net_buffer_days < 0 ? 1 : 0,
      loan: item.rupees_at_risk * 2,
      emi: Math.round(item.rupees_at_risk / 3),
      upiShare: 0.65,
      appShare: 0.2,
      digitalShare: 0.85,
      dscr: 1.1,
      creditHeadroom: item.credit_headroom,
      suggestedEmi: item.bridge_headroom > 0 ? Math.round(item.bridge_headroom / 6) : 0,
    },
    history: [
      { w: "08 Jul", net: 12000, inflow: 40000, outflow: 28000 },
      { w: "15 Jul", net: 8000, inflow: 38000, outflow: 30000 },
      { w: "22 Jul", net: -5000, inflow: 30000, outflow: 35000 },
      { w: "29 Jul", net: -12000, inflow: 25000, outflow: 37000 },
    ],
  };
}

/**
 * Converts EnterpriseDetailsResponse (GET /enterprise/{id}) into Enterprise format
 */
export function enterpriseDetailsToEnterprise(details: EnterpriseDetailsResponse): Enterprise {
  const card: EnterpriseCard = details.card;
  const riskTier = (card.risk_tier as "AMBER" | "RED" | "GREEN") || "AMBER";
  const score = Math.round(card.score <= 1 ? card.score * 100 : card.score);

  const reasonsList = [card.reason_1, card.reason_2, card.reason_3]
    .filter((r): r is string => Boolean(r && r.trim()))
    .map((r) => ({
      key: r,
      tag: r.replace(/_/g, " ").toUpperCase(),
      detail: `Risk indicator: ${r.replace(/_/g, " ")}`,
    }));

  // Build forecast arrays from live_forecast if present
  let forecastMonthly: number[] = [30000, 25000, 20000, 15000, 10000, 5000];
  let forecastBands: [number, number][] = [
    [25000, 55000],
    [20000, 48000],
    [15000, 42000],
    [10000, 35000],
    [8000, 30000],
    [5000, 25000],
  ];

  if (details.live_forecast && details.live_forecast.length > 0) {
    forecastMonthly = details.live_forecast.map((f) => f.p50);
    forecastBands = details.live_forecast.map((f) => [f.p10, f.p90]);
  }

  const netBuffer = card.net_buffer_days ?? -10;
  const creditHeadroom = card.credit_headroom ?? 0;
  const bridgeHeadroom = card.bridge_headroom ?? 0;

  return {
    id: card.enterprise_id,
    name: card.business_name || card.proprietor_name || `Enterprise ${card.enterprise_id}`,
    segment: (card.sector as string) || "MSME",
    district: (card.district as string) || "District",
    phone: "+91 9876543210",
    tier: riskTier,
    score: score,
    confidence: { score: 88, label: "High" },
    forecastBand: forecastBands,
    reasons: reasonsList,
    adviceKeys: reasonsList.map((r) => r.key),
    forecast90: card.forecast_net_90d_p50 ?? 30000,
    forecast180: (card.forecast_net_90d_p50 ?? 30000) * 1.5,
    netNow90: card.forecast_net_90d_p10 ?? -25000,
    monthlyForecast: forecastMonthly,
    metrics: {
      avgInflow30: 50000,
      outInRatio: 1.12,
      zeroDays: Math.abs(Math.min(0, netBuffer)),
      volatility: 0.4,
      trend: -0.1,
      savings: bridgeHeadroom,
      runwayMonths: Math.max(0, Math.round(((netBuffer + 30) / 30) * 10) / 10),
      missedEmi: netBuffer < 0 ? 1 : 0,
      loan: 500000,
      emi: 25000,
      upiShare: 0.6,
      appShare: 0.2,
      digitalShare: card.digital_share ?? 0.8,
      dscr: card.rule_score ? Number((card.rule_score * 4).toFixed(2)) : 1.2,
      creditHeadroom: creditHeadroom,
      suggestedEmi: bridgeHeadroom > 0 ? Math.round(bridgeHeadroom / 6) : 0,
    },
    history: [
      { w: "08 Jul", net: 12000, inflow: 40000, outflow: 28000 },
      { w: "15 Jul", net: 8000, inflow: 38000, outflow: 30000 },
      { w: "22 Jul", net: -5000, inflow: 30000, outflow: 35000 },
      { w: "29 Jul", net: -12000, inflow: 25000, outflow: 37000 },
    ],
  };
}
