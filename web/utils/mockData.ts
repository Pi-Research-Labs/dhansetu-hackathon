export interface Enterprise {
  id: string;
  name: string;
  segment: string;
  district: string;
  phone: string;
  tier: "GREEN" | "AMBER" | "RED";
  score: number;
  confidence: { score: number; label: string };
  forecastBand: [number, number][];
  reasons: { key: string; tag: string; detail: string }[];
  adviceKeys: string[];
  forecast90: number;
  forecast180: number;
  netNow90: number;
  monthlyForecast: number[];
  metrics: {
    avgInflow30: number;
    outInRatio: number;
    zeroDays: number;
    volatility: number;
    trend: number;
    savings: number;
    runwayMonths: number;
    missedEmi: number;
    loan: number;
    emi: number;
    upiShare: number;
    appShare: number;
    digitalShare: number;
    dscr: number | null;
    creditHeadroom: number;
    suggestedEmi: number;
  };
  history: { w: string; net: number; inflow: number; outflow: number }[];
}

export interface MockDataSet {
  generated: string;
  backtest: {
    h90: { mae: number; mae_naive: number; improvement_pct: number; directional_accuracy_pct: number };
    h180: { mae: number; mae_naive: number; improvement_pct: number; directional_accuracy_pct: number };
  };
  enterprises: Enterprise[];
}

export const DATA: MockDataSet = {
  generated: "2026-07-15",
  backtest: {
    h90: { mae: 34352, mae_naive: 48521, improvement_pct: 29.2, directional_accuracy_pct: 98.6 },
    h180: { mae: 37608, mae_naive: 88396, improvement_pct: 57.5, directional_accuracy_pct: 100.0 },
  },
  enterprises: [
    {
      id: "E024",
      name: "Vaagu Valley FPO",
      segment: "FPO",
      district: "Karimnagar",
      phone: "+91 9292603993",
      tier: "AMBER",
      score: 45,
      confidence: { score: 74, label: "Medium" },
      forecastBand: [
        [94312, 225390],
        [86447, 233255],
        [78583, 241119],
        [8393, 81345],
        [5175, 84563],
        [1956, 87782],
      ],
      reasons: [
        { key: "repayment_stress", tag: "Repayment stress", detail: "3 missed EMI(s) in the last 90 days" },
        { key: "anomaly", tag: "Behavioural anomaly", detail: "Transaction pattern is an outlier vs healthy portfolio" },
      ],
      adviceKeys: ["repayment_stress"],
      forecast90: 479553,
      forecast180: 614161,
      netNow90: -25220,
      monthlyForecast: [159851, 159851, 159851, 44869, 44869, 44869],
      metrics: {
        avgInflow30: 14939,
        outInRatio: 0.97,
        zeroDays: 2,
        volatility: 0.86,
        trend: -0.106,
        savings: 737371,
        runwayMonths: 1.7,
        missedEmi: 3,
        loan: 805423,
        emi: 33559,
        upiShare: 0.73,
        appShare: 0.12,
        digitalShare: 0.85,
        dscr: 3.05,
        creditHeadroom: 0,
        suggestedEmi: 0,
      },
      history: [
        { w: "08 Mar", net: 7049, inflow: 111755, outflow: 104706 },
        { w: "15 Mar", net: 55988, inflow: 164050, outflow: 108062 },
        { w: "22 Mar", net: 3582, inflow: 128937, outflow: 125355 },
        { w: "29 Mar", net: 31322, inflow: 191464, outflow: 160142 },
        { w: "05 Apr", net: 83767, inflow: 218697, outflow: 134930 },
        { w: "12 Apr", net: 107857, inflow: 252364, outflow: 144507 },
        { w: "19 Apr", net: 151342, inflow: 322310, outflow: 170968 },
        { w: "26 Apr", net: 40851, inflow: 142668, outflow: 101817 },
        { w: "03 May", net: 15090, inflow: 125965, outflow: 110875 },
        { w: "10 May", net: 8694, inflow: 115588, outflow: 106894 },
        { w: "17 May", net: -34965, inflow: 126719, outflow: 161684 },
        { w: "24 May", net: -12525, inflow: 96707, outflow: 109232 },
        { w: "31 May", net: -53959, inflow: 88298, outflow: 142257 },
        { w: "07 Jun", net: -1364, inflow: 127424, outflow: 128788 },
        { w: "14 Jun", net: -49194, inflow: 119544, outflow: 168738 },
        { w: "21 Jun", net: 17235, inflow: 121479, outflow: 104244 },
        { w: "28 Jun", net: -23515, inflow: 96961, outflow: 120476 },
        { w: "05 Jul", net: 2366, inflow: 84863, outflow: 82497 },
        { w: "12 Jul", net: -20815, inflow: 79220, outflow: 100035 },
        { w: "19 Jul", net: 29902, inflow: 72400, outflow: 42498 },
      ],
    },
    {
      id: "E046",
      name: "Venkata Layer Farm",
      segment: "Poultry Unit",
      district: "Karimnagar",
      phone: "+91 9107924105",
      tier: "GREEN",
      score: 0,
      confidence: { score: 85, label: "High" },
      forecastBand: [
        [38988, 72406],
        [36983, 74411],
        [34978, 76416],
        [26834, 63820],
        [25202, 65452],
        [23570, 67084],
      ],
      reasons: [],
      adviceKeys: ["on_track"],
      forecast90: 167091,
      forecast180: 303072,
      netNow90: 117520,
      monthlyForecast: [55697, 55697, 55697, 45327, 45327, 45327],
      metrics: {
        avgInflow30: 6422,
        outInRatio: 0.78,
        zeroDays: 0,
        volatility: 0.37,
        trend: 0.017,
        savings: 313262,
        runwayMonths: 2.1,
        missedEmi: 0,
        loan: 103468,
        emi: 4311,
        upiShare: 0.78,
        appShare: 0.06,
        digitalShare: 0.84,
        dscr: 11.72,
        creditHeadroom: 283986,
        suggestedEmi: 13368,
      },
      history: [
        { w: "08 Mar", net: 5917, inflow: 44885, outflow: 38968 },
        { w: "15 Mar", net: -316, inflow: 36708, outflow: 37024 },
        { w: "22 Mar", net: 4794, inflow: 36186, outflow: 31392 },
        { w: "29 Mar", net: 9002, inflow: 49159, outflow: 40157 },
        { w: "05 Apr", net: 5976, inflow: 44991, outflow: 39015 },
        { w: "12 Apr", net: 16758, inflow: 51678, outflow: 34920 },
        { w: "19 Apr", net: 6693, inflow: 42763, outflow: 36070 },
        { w: "26 Apr", net: 8627, inflow: 43958, outflow: 35331 },
        { w: "03 May", net: 20334, inflow: 61111, outflow: 40777 },
        { w: "10 May", net: 6329, inflow: 38292, outflow: 31963 },
        { w: "17 May", net: 8053, inflow: 41199, outflow: 33146 },
        { w: "24 May", net: 8695, inflow: 48445, outflow: 39750 },
        { w: "31 May", net: 12834, inflow: 45999, outflow: 33165 },
        { w: "07 Jun", net: 3268, inflow: 37643, outflow: 34375 },
        { w: "14 Jun", net: 7495, inflow: 42452, outflow: 34957 },
        { w: "21 Jun", net: 10915, inflow: 40914, outflow: 29999 },
        { w: "28 Jun", net: 18203, inflow: 58581, outflow: 40378 },
        { w: "05 Jul", net: -1058, inflow: 32333, outflow: 33391 },
        { w: "12 Jul", net: 4258, inflow: 38346, outflow: 34088 },
        { w: "19 Jul", net: 11416, inflow: 27846, outflow: 16430 },
      ],
    },
    {
      id: "E020",
      name: "Deccan Millets FPO",
      segment: "FPO",
      district: "Nizamabad",
      phone: "+91 9637057779",
      tier: "AMBER",
      score: 25,
      confidence: { score: 76, label: "High" },
      forecastBand: [
        [100838, 229780],
        [93102, 237516],
        [85366, 245252],
        [43152, 140632],
        [38852, 144932],
        [34551, 149233],
      ],
      reasons: [
        { key: "spend_exceeds", tag: "Spend exceeds earnings", detail: "Outflows are 1.01x inflows over 30 days" },
      ],
      adviceKeys: ["spend_exceeds"],
      forecast90: 495928,
      forecast180: 771603,
      netNow90: 239978,
      monthlyForecast: [165309, 165309, 165309, 91892, 91892, 91892],
      metrics: {
        avgInflow30: 14852,
        outInRatio: 1.01,
        zeroDays: 0,
        volatility: 0.57,
        trend: -0.135,
        savings: 942177,
        runwayMonths: 2.1,
        missedEmi: 0,
        loan: 0,
        emi: 0,
        upiShare: 0.67,
        appShare: 0.07,
        digitalShare: 0.74,
        dscr: null,
        creditHeadroom: 0,
        suggestedEmi: 0,
      },
      history: [
        { w: "08 Mar", net: 49050, inflow: 144253, outflow: 95203 },
        { w: "15 Mar", net: 57456, inflow: 142513, outflow: 85057 },
        { w: "22 Mar", net: -3735, inflow: 138364, outflow: 142099 },
        { w: "29 Mar", net: 35623, inflow: 139251, outflow: 103628 },
        { w: "05 Apr", net: 58112, inflow: 161166, outflow: 103054 },
        { w: "12 Apr", net: 92801, inflow: 211384, outflow: 118583 },
        { w: "19 Apr", net: 31849, inflow: 158752, outflow: 126903 },
        { w: "26 Apr", net: 35250, inflow: 180575, outflow: 145325 },
        { w: "03 May", net: 64841, inflow: 139768, outflow: 74927 },
        { w: "10 May", net: 46749, inflow: 148503, outflow: 101754 },
        { w: "17 May", net: 32076, inflow: 146074, outflow: 113998 },
        { w: "24 May", net: 25463, inflow: 104648, outflow: 79185 },
        { w: "31 May", net: 23019, inflow: 118617, outflow: 95598 },
        { w: "07 Jun", net: 2064, inflow: 86907, outflow: 84843 },
        { w: "14 Jun", net: -5842, inflow: 92671, outflow: 98513 },
        { w: "21 Jun", net: 9173, inflow: 96163, outflow: 86990 },
        { w: "28 Jun", net: -29330, inflow: 84196, outflow: 113526 },
        { w: "05 Jul", net: 26943, inflow: 139456, outflow: 112513 },
        { w: "12 Jul", net: -15452, inflow: 103660, outflow: 119112 },
        { w: "19 Jul", net: -2204, inflow: 33652, outflow: 35856 },
      ],
    },
    {
      id: "E007",
      name: "Manikanta Stores",
      segment: "Kirana Store",
      district: "Warangal",
      phone: "+91 9883834626",
      tier: "RED",
      score: 100,
      confidence: { score: 85, label: "High" },
      forecastBand: [
        [11432, 21230],
        [10844, 21818],
        [10256, 22406],
        [5174, 16694],
        [4666, 17202],
        [4157, 17711],
      ],
      reasons: [
        { key: "sustained_erosion", tag: "Sustained erosion", detail: "Inflows slid 35% against 6-month baseline" },
        { key: "spend_exceeds", tag: "Spend exceeds earnings", detail: "Outflows 1.41x inflows over 30 days" },
        { key: "repayment_stress", tag: "Repayment stress", detail: "1 missed EMI in last 90 days" },
      ],
      adviceKeys: ["sustained_erosion", "repayment_stress"],
      forecast90: 48993,
      forecast180: 81794,
      netNow90: -24495,
      monthlyForecast: [16331, 16331, 16331, 10934, 10934, 10934],
      metrics: {
        avgInflow30: 2221,
        outInRatio: 1.41,
        zeroDays: 1,
        volatility: 0.41,
        trend: -0.216,
        savings: 12643,
        runwayMonths: 0.1,
        missedEmi: 1,
        loan: 203331,
        emi: 8472,
        upiShare: 0.73,
        appShare: 0.15,
        digitalShare: 0.88,
        dscr: 1.61,
        creditHeadroom: 0,
        suggestedEmi: 0,
      },
      history: [
        { w: "08 Mar", net: 7293, inflow: 26459, outflow: 19166 },
        { w: "15 Mar", net: 4444, inflow: 23983, outflow: 19539 },
        { w: "22 Mar", net: 4956, inflow: 27327, outflow: 22371 },
        { w: "29 Mar", net: 2629, inflow: 21610, outflow: 18981 },
        { w: "05 Apr", net: 8216, inflow: 32227, outflow: 24011 },
        { w: "12 Apr", net: 5309, inflow: 30491, outflow: 25182 },
        { w: "19 Apr", net: 5469, inflow: 25998, outflow: 20529 },
        { w: "26 Apr", net: 7230, inflow: 27333, outflow: 20103 },
        { w: "03 May", net: -190, inflow: 24163, outflow: 24353 },
        { w: "10 May", net: 2160, inflow: 22945, outflow: 20785 },
        { w: "17 May", net: -1145, inflow: 21349, outflow: 22494 },
        { w: "24 May", net: -3275, inflow: 21940, outflow: 25215 },
        { w: "31 May", net: -2055, inflow: 19997, outflow: 22052 },
        { w: "07 Jun", net: -318, inflow: 19991, outflow: 20309 },
        { w: "14 Jun", net: 337, inflow: 18660, outflow: 18323 },
        { w: "21 Jun", net: -4475, inflow: 15410, outflow: 19885 },
        { w: "28 Jun", net: -4008, inflow: 16153, outflow: 20161 },
        { w: "05 Jul", net: -6079, inflow: 17408, outflow: 23487 },
        { w: "12 Jul", net: -8862, inflow: 12732, outflow: 21594 },
        { w: "19 Jul", net: -4021, inflow: 7662, outflow: 11683 },
      ],
    },
  ],
};

export function formatCurrency(val: number): string {
  if (val === null || val === undefined) return "₹0";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}
