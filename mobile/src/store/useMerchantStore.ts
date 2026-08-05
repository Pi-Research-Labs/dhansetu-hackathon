// import { create } from 'zustand';
// import { SupportedLang } from '@/i18n/translations';

// export interface Entry {
//   id: string;
//   type: 'income' | 'expense' | 'savdep' | 'savwd' | 'emi' | 'newloan';
//   amount: number;
//   note: string;
//   date: string;
// }

// export interface MarketRisk {
//   tag: string;
//   severity: 'high' | 'medium' | 'low';
//   desc: string;
// }

// export interface MerchantStore {
//   // Language
//   lang: SupportedLang;
//   setLang: (lang: SupportedLang) => void;
//   hasChosenLang: boolean;
//   setHasChosenLang: (val: boolean) => void;

//   // Merchant details
//   name: string;
//   segment: string;
//   district: string;
//   phone: string;
//   gstin: string;
//   tier: 'GREEN' | 'AMBER' | 'RED';
//   score: number;

//   // Financial metrics
//   net90: number;
//   savings: number;
//   runwayMonths: number;
//   missedEmi: number;
//   loan: number;
//   emi: number;
//   upiShare: number;
//   appShare: number;
//   cashShare: number;

//   // Weekly historical data
//   weeklyHistory: { week: string; inflow: number; outflow: number; net: number }[];

//   // Risk Flags & Advice
//   flags: { key: string; tag: string; detail: string }[];
//   advice: string[];

//   // Entries ledger
//   entries: Entry[];
//   addEntry: (entry: Omit<Entry, 'id' | 'date'>) => void;
// }

// export const useMerchantStore = create<MerchantStore>((set) => ({
//   lang: 'en',
//   setLang: (lang) => set({ lang }),
//   hasChosenLang: false,
//   setHasChosenLang: (hasChosenLang) => set({ hasChosenLang }),

//   name: 'Sri Venkateshwara Kirana',
//   segment: 'Kirana Store',
//   district: 'Karimnagar',
//   phone: '+91 9905049230',
//   gstin: '36AAAAA0000A1Z5',
//   tier: 'AMBER',
//   score: 45,

//   net90: -25220,
//   savings: 737371,
//   runwayMonths: 1.7,
//   missedEmi: 3,
//   loan: 805423,
//   emi: 33559,
//   upiShare: 0.73,
//   appShare: 0.12,
//   cashShare: 0.15,

//   weeklyHistory: [
//     { week: '08 Mar', inflow: 111755, outflow: 104706, net: 7049 },
//     { week: '15 Mar', inflow: 164050, outflow: 108062, net: 55988 },
//     { week: '22 Mar', inflow: 128937, outflow: 125355, net: 3582 },
//     { week: '29 Mar', inflow: 191464, outflow: 160142, net: 31322 },
//     { week: '05 Apr', inflow: 218697, outflow: 134930, net: 83767 },
//     { week: '12 Apr', inflow: 252364, outflow: 144507, net: 107857 },
//     { week: '19 Apr', inflow: 322310, outflow: 170968, net: 151342 },
//     { week: '26 Apr', inflow: 142668, outflow: 101817, net: 40851 },
//     { week: '03 May', inflow: 125965, outflow: 110875, net: 15090 },
//     { week: '10 May', inflow: 115588, outflow: 106894, net: 8694 },
//     { week: '17 May', inflow: 126719, outflow: 161684, net: -34965 },
//     { week: '24 May', inflow: 96707, outflow: 109232, net: -12525 },
//     { week: '31 May', inflow: 88298, outflow: 142257, net: -53959 },
//     { week: '07 Jun', inflow: 127424, outflow: 128788, net: -1364 },
//     { week: '14 Jun', inflow: 119544, outflow: 168738, net: -49194 },
//     { week: '21 Jun', inflow: 121479, outflow: 104244, net: 17235 },
//     { week: '28 Jun', inflow: 96961, outflow: 120476, net: -23515 },
//     { week: '05 Jul', inflow: 84863, outflow: 82497, net: 2366 },
//     { week: '12 Jul', inflow: 79220, outflow: 100035, net: -20815 },
//     { week: '19 Jul', inflow: 72400, outflow: 42498, net: 29902 },
//   ],

//   flags: [
//     { key: 'repayment_stress', tag: 'Repayment Stress', detail: '3 missed EMI(s) in the last 90 days' },
//     { key: 'spend_exceeds', tag: 'Spend Exceeds Earnings', detail: 'Outflows are 1.01x inflows over the last 30 days' },
//     { key: 'thin_buffer', tag: 'Thin Savings Buffer', detail: 'Savings cover only ~1.7 months of typical outflows' },
//   ],

//   advice: [
//     'Protect your credit record: pay the next EMI first, and speak to your bank about restructuring BEFORE missing another instalment.',
//     'You are spending more than you earn this month — defer non-essential purchases and negotiate credit terms with suppliers.',
//     'Set aside part of every good week until savings cover at least one month of expenses — that buffer is what gets you through a bad season.',
//   ],

//   entries: [
//     { id: 'e1', type: 'income', amount: 4500, note: 'Daily Kirana Collections (UPI)', date: 'Today' },
//     { id: 'e2', type: 'expense', amount: 1850, note: 'Rice & Wheat Flour Wholesale Stock', date: 'Yesterday' },
//     { id: 'e3', type: 'savdep', amount: 500, note: 'Weekly Micro Savings Deposit', date: '28 Jul' },
//     { id: 'e4', type: 'emi', amount: 33559, note: 'Monthly Working Capital EMI', date: '25 Jul' },
//   ],

//   addEntry: (newEntry) => set((state) => ({
//     entries: [
//       {
//         ...newEntry,
//         id: `e_${Date.now()}`,
//         date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
//       },
//       ...state.entries,
//     ],
//   })),
// }));


import { create } from 'zustand';
import { SupportedLang } from '@/i18n/translations';

export interface Entry {
  id: string;
  type: 'income' | 'expense' | 'savdep' | 'savwd' | 'emi' | 'newloan';
  amount: number;
  note: string;
  date: string;
}

export interface MarketRisk {
  tag: string;
  severity: 'high' | 'medium' | 'low';
  desc: string;
}

export interface MerchantStore {
  // Language
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  hasChosenLang: boolean;
  setHasChosenLang: (val: boolean) => void;

  // Merchant details
  name: string;
  segment: string;
  district: string;
  phone: string;
  gstin: string;
  tier: 'GREEN' | 'AMBER' | 'RED';
  score: number;

  // Financial metrics
  net90: number;
  savings: number;
  runwayMonths: number;
  missedEmi: number;
  loan: number;
  emi: number;
  upiShare: number;
  appShare: number;
  cashShare: number;

  // Weekly historical data
  weeklyHistory: { week: string; inflow: number; outflow: number; net: number }[];

  // Risk Flags & Advice
  flags: { key: string; tag: string; detail: string }[];
  advice: string[];

  // Entries ledger
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'date'>) => void;
}

export const useMerchantStore = create<MerchantStore>((set) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  hasChosenLang: false,
  setHasChosenLang: (hasChosenLang) => set({ hasChosenLang }),

  name: 'Furukawa Bakery (古河パン)',
  segment: 'Bakery & Dango Merchant',
  district: 'Hikarizaka City',
  phone: '+91 98765 43210',
  gstin: '36FURUKAWA0504Z5',
  tier: 'GREEN',
  score: 88,

  net90: 145220,
  savings: 987371,
  runwayMonths: 4.5,
  missedEmi: 0,
  loan: 250000,
  emi: 12500,
  upiShare: 0.82,
  appShare: 0.12,
  cashShare: 0.06,

  weeklyHistory: [
    { week: '08 Mar', inflow: 145000, outflow: 92000, net: 53000 },
    { week: '15 Mar', inflow: 168050, outflow: 98000, net: 70050 },
    { week: '22 Mar', inflow: 189370, outflow: 105000, net: 84370 },
    { week: '29 Mar', inflow: 210400, outflow: 110000, net: 100400 },
    { week: '05 Apr', inflow: 248000, outflow: 115000, net: 133000 },
    { week: '12 Apr', inflow: 292000, outflow: 120000, net: 172000 },
    { week: '19 Apr', inflow: 342000, outflow: 130000, net: 212000 },
    { week: '26 Apr', inflow: 182000, outflow: 95000, net: 87000 },
    { week: '03 May', inflow: 195000, outflow: 100000, net: 95000 },
    { week: '10 May', inflow: 215000, outflow: 102000, net: 113000 },
    { week: '17 May', inflow: 236000, outflow: 108000, net: 128000 },
    { week: '24 May', inflow: 280000, outflow: 112000, net: 168000 },
    { week: '31 May', inflow: 310000, outflow: 125000, net: 185000 },
    { week: '07 Jun', inflow: 295000, outflow: 118000, net: 177000 },
    { week: '14 Jun', inflow: 330000, outflow: 122000, net: 208000 },
    { week: '21 Jun', inflow: 360000, outflow: 130000, net: 230000 },
    { week: '28 Jun', inflow: 385000, outflow: 135000, net: 250000 },
    { week: '05 Jul', inflow: 410000, outflow: 140000, net: 270000 },
    { week: '12 Jul', inflow: 435000, outflow: 145000, net: 290000 },
    { week: '19 Jul', inflow: 470000, outflow: 150000, net: 320000 },
  ],

  flags: [
    { key: 'dango_demand', tag: 'Dango Surge', detail: 'Dango Daikazoku merch demand spiked by 140% this week!' },
    { key: 'rainbow_bread', tag: 'Experimental Recipe', detail: 'Sanae’s Rainbow Bread ingredient costs increased by 12%' },
    { key: 'festival_prep', tag: 'Hikarizaka Festival', detail: 'Drama Club catering deposit received successfully' },
  ],

  advice: [
    'Sanae’s experimental bread sales fluctuate — keep Dango Daikazoku plushies & Anpan as core high-margin cashflow drivers!',
    'Akio yelled "I LOVE YOUR BREAD SANAE!" in the street — customer retention is up 40%!',
    'Tomoya and Nagisa completed the Drama Club play — Hikarizaka High School festival revenue boost confirmed.',
  ],

  entries: [
    { id: 'e1', type: 'income', amount: 14500, note: 'Nagisa Special Dango Daikazoku Merch (UPI)', date: 'Today' },
    { id: 'e2', type: 'income', amount: 6200, note: 'Akio Classic Anpan & Jam Bread Sales', date: 'Yesterday' },
    { id: 'e3', type: 'expense', amount: 2150, note: 'Sanae Special Rainbow Bread Ingredients', date: '28 Jul' },
    { id: 'e4', type: 'income', amount: 18000, note: 'Hikarizaka High School Drama Club Catering', date: '25 Jul' },
    { id: 'e5', type: 'emi', amount: 12500, note: 'Bakery Deck Oven Loan EMI (Hikarizaka Bank)', date: '20 Jul' },
  ],

  addEntry: (newEntry) => set((state) => ({
    entries: [
      {
        ...newEntry,
        id: `e_${Date.now()}`,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      },
      ...state.entries,
    ],
  })),
}));
