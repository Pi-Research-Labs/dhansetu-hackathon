# DhanSetu — Field Officer Dashboard

The web console a NABARD/bank field officer or credit manager uses to triage
their caseload, understand *why* an enterprise is flagged, and file the outcome
of a field visit.

Live: **https://dhansetu.piresearchlabs.com**

Part of the [DhanSetu monorepo](../README.md). API contract: [`../API.md`](../API.md).

## Stack

| | |
|---|---|
| Framework | Next.js 16.2 (App Router), React 19, TypeScript |
| State | Redux Toolkit 2.12 — auth + language |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3.10, plus hand-written SVG sparklines |
| HTTP | Axios, bearer interceptor with 401 handling |
| Icons | lucide-react |
| Deploy | Vercel (via the GitHub app — no workflow file) |

## Run locally

```bash
npm install
npm run dev        # → http://localhost:3000
```

Sign in with the officer demo credentials — `8000000001` / `Prakash@FO1`. The
login form has an **Auto Fill Credentials** link that fills them for you.

The backend base URL lives in [`utils/constants.ts`](utils/constants.ts) and
points at the deployed API by default. Change it to `http://localhost:8000/api/v1`
to develop against a local backend.

> The deployed API is only reachable 09:00–21:00 IST — the VM runs on a
> cost-saving schedule. Run the backend locally outside that window.

## What's on screen

Three tabs, all live API data with no mock fallback.

**My Portfolio** — the officer's own book, ranked by rupees at risk rather than
by an abstract score. Search, block and segment filters, tier pills with live
counts, and a net-cashflow sparkline per row. Selecting an enterprise opens:

- the detail card — tier, headroom pills, today's district heat stress (THI), six
  KPI tiles, a zoomable Google static map tile, and a weekly net-cashflow heatmap
  with a 7/14-week selector
- a forecast chart with a confidence band, and a weekly inflow/outflow history
- the udhaar book / receivables ageing table
- payment-channel mix, whose segments cross-navigate into the Transactions tab
- risk and early warnings, including an LLM-written plain-language read of the
  numbers in the officer's chosen language, plus mechanism-matched recommended
  actions with real figures injected
- the field-visit outcome form, which closes an `officer_tasks` row and produces
  a training label

**Market Intelligence** — sector price/rainfall dual-axis chart, productivity
outlook, seasonal pattern, and climate/market risk cards with severity meters.

**Transactions** — the itemised live ledger, filterable by enterprise, direction
and tender, showing each voice entry's actual spoken transcript alongside the
amount.

## Design notes

**Scores are de-jargoned on purpose.** The UI says "Chance of cash trouble" and
"Overall risk rating — 42/100 (Watch)", not `prob_stress` and `fused_score`, each
with an explanatory tooltip. Forecast tooltips read "Best case (if things go
well)". This is read by a field officer on a bike, not by a quant.

**Four languages** — English, हिंदी, తెలుగు, मराठी — switched from the header
avatar menu. The chosen language is also sent to the backend, so the AI summary
comes back in it. Coverage is complete for the portfolio tab; some
Market-Intelligence and form strings are still English-only.

## Layout

```
app/                    3 routes: / (landing), /login, /dashboard
components/
├── common/Header.tsx   sticky nav, language + session menu
├── landing/            hero, animated network SVG, backtest stats, features
├── login/              officer sign-in
└── dashboard/          the three tabs and every panel inside them
utils/
├── api-config.ts       typed client — one function per endpoint
├── constants.ts        API base URL
├── formatters.ts       en-IN currency and compact number formatting
└── translations/       4-language typed dictionary
redux/                  store, auth slice, language slice
```
