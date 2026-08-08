/**
 * Mock data utility for detachable sparkline graphs.
 * Set ENABLE_MOCK_SPARKLINE_DATA to false when backend API returns real weekly history and forecast data.
 */
export const ENABLE_MOCK_SPARKLINE_DATA = true;

export interface SparklineData {
  history: { net: number }[];
  fc: number[];
}

/**
 * Generates detachable mock sparkline graph data (14 weeks history, 6 forecast points)
 * for a given enterprise/worklist item based on its ID and risk tier.
 * Simply set ENABLE_MOCK_SPARKLINE_DATA = false to detach.
 */
// export function getWorklistSparkData(
//   enterpriseId: string,
//   riskTier: string = "AMBER",
//   rupeesAtRisk: number = 20000,
//   projectedShortfall: number = 15000
// ): SparklineData {
//   if (!ENABLE_MOCK_SPARKLINE_DATA) {
//     return { history: [], fc: [] };
//   }

//   // Deterministic seed based on enterpriseId
//   const seed = enterpriseId
//     .split("")
//     .reduce((acc, char) => acc + char.charCodeAt(0), 0);

//   const tier = (riskTier || "AMBER").toUpperCase();
//   const isRed = tier === "RED";
//   const isAmber = tier === "AMBER";

//   const baseNet = isRed ? -12000 : isAmber ? 6000 : 24000;
//   const atRisk = rupeesAtRisk || 20000;
//   const shortfall = projectedShortfall || 15000;

//   // const history = [
//   //   { net: baseNet + ((seed * 7) % 6000) - 3000 },
//   //   { net: baseNet + ((seed * 13) % 8000) - 4000 },
//   //   { net: baseNet + ((seed * 19) % 7000) - 3500 },
//   //   { net: baseNet + ((seed * 29) % 9000) - 4500 },
//   //   { net: baseNet + ((seed * 37) % 5000) - 2500 },
//   //   { net: baseNet + ((seed * 43) % 8500) - 4250 },
//   //   { net: baseNet + ((seed * 53) % 6500) - 3250 },
//   //   { net: baseNet + ((seed * 61) % 9500) - 4750 },
//   //   { net: baseNet + ((seed * 71) % 7500) - 3750 },
//   //   { net: baseNet + ((seed * 79) % 8000) - 4000 },
//   //   { net: baseNet + ((seed * 83) % 6000) - 3000 },
//   //   { net: baseNet + ((seed * 89) % 9000) - 4500 },
//   //   { net: baseNet + ((seed * 97) % 5500) - 2750 },
//   //   { net: isRed ? -atRisk / 4 : isAmber ? -shortfall / 8 : baseNet + 4000 },
//   // ];

//   // const monthlyForecast = [
//   //   isRed ? -shortfall / 3 : isAmber ? 8000 : 28000,
//   //   isRed ? -shortfall / 3.5 : isAmber ? 10000 : 30000,
//   //   isRed ? -shortfall / 4 : isAmber ? 12000 : 32000,
//   //   isRed ? -shortfall / 5 : isAmber ? 15000 : 35000,
//   //   isRed ? -shortfall / 6 : isAmber ? 18000 : 38000,
//   //   isRed ? 2000 : isAmber ? 20000 : 40000,
//   // ];

//   // const fc = monthlyForecast.map((m) => m / 4.33);

//   // return { history, fc };
// }

export type { Enterprise, EnterpriseMetrics, EnterpriseHistoryItem, EnterpriseReason } from "@/types/enterprise";
export { formatCurrency } from "@/utils/formatters";
