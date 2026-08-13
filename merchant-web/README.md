# DhanSetu — Merchant Web Portal

The browser version of the merchant experience: log a sale by speaking it, see
where the business stands, and read early warnings in plain language. A web port
of the [Android app](../mobile) with a public landing page and desktop layouts on
top.

Live: **https://dhansetu-merchant.piresearchlabs.com**

Part of the [DhanSetu monorepo](../README.md). API contract: [`../API.md`](../API.md).

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router), React 19, TypeScript |
| State | Zustand 5, persisted through an SSR-safe localStorage adapter |
| Styling | Tailwind CSS v4 |
| Charts | Hand-written SVG, click-to-inspect — no chart library |
| Voice | Browser `MediaRecorder` → `POST /voice/entries` |
| Forms | react-hook-form + Zod |
| Icons | lucide-react |
| Deploy | Vercel (via the GitHub app — no workflow file) |

## Run locally

```bash
npm install
npm run dev -- -p 3001      # → http://localhost:3001
```

Sign in with `9000000031` / `Lakshmi@0031`. The API base URL is in
[`utils/api-config.ts`](utils/api-config.ts).

> The deployed API is only reachable 09:00–21:00 IST. Run the backend locally
> outside that window.

## Screens

| Route | What it does |
|---|---|
| `/` | Public landing page — hero, network diagram, backtest stats, features, stakeholders |
| `/login` | Phone + password, with show/hide and remember-device |
| `/dashboard` | KPIs, weekly cashflow chart, collection channels, udhaar book, today's entry totals |
| `/dashboard/add-entry` | Voice agent, typed ledger form, paged transaction history with a custom date-range picker |
| `/dashboard/alerts` | Risk flags with real figures interpolated, plus numbered recommendations |
| `/dashboard/market` | Commodity price and rainfall chart, productivity outlook, climate risks |
| `/dashboard/account` | Profile, language, security and support, verified shop-location map tile |

## The voice flow

Tap **Tap to Speak** → browser mic permission → a live `0:07 / 0:30` counter
(auto-stops at 30s, matching Sarvam's synchronous STT limit) → "Processing voice
note with AI…" → a review modal pre-filled with the extracted **amount**,
**direction** and the **actual transcript**, all editable.

**Nothing is written to the ledger until the merchant confirms.** `POST
/voice/entries` transcribes and parses only; the commit is a separate `POST
/enterprise/{id}/transactions` carrying the `voice_id`. That split is deliberate —
a speech model's guess should never silently become a financial record.

## SMS parsing

`utils/sms-parser.ts` and `utils/bank-sms-registry.ts` are **byte-identical** to
their counterparts in `mobile/src/utils/` — 27 institution profiles, TRAI DLT
sender decoding, an 11-step parse and a dedup key.

On the web they are reference implementations only: automatic capture needs an
Android `BroadcastReceiver`, so the Account page correctly shows those toggles as
*"only available on phone app"*. Rows captured on the phone do appear here,
labelled **"Auto-detected via SMS"** — the same account, both devices.

## i18n

Four languages — English, हिन्दी, मराठी, తెలుగు — switchable from the landing
header, the login page, or Account, and persisted.

Two dictionaries exist for historical reasons: [`i18n/translations.ts`](i18n/translations.ts)
serves the authenticated app, and [`utils/translations/dictionary.ts`](utils/translations/dictionary.ts)
serves the landing page. Several dashboard strings remain English-only; the
Android app has the more complete coverage.

Free prose from the database is machine-translated at read time via
[`utils/translator.ts`](utils/translator.ts), cached per `(text, language)` pair
for the session so a screen costs one call per string rather than one per render.

## Layout

```
app/
├── page.tsx              landing
├── login/
└── dashboard/            layout (sidebar + mobile tab bar) and 5 screens
components/
├── charts/               WeeklyCashflowChart, MarketPriceChart — bespoke SVG
├── common/               GovHeader, SecurityBadge, CustomAlert
└── landing/              hero, network illustration, features, stakeholders
store/useMerchantStore.ts Zustand store — auth, entries, charts, SMS counters
utils/
├── api-config.ts         typed client, axios bearer interceptor
├── sms-parser.ts         shared with mobile/
├── bank-sms-registry.ts  shared with mobile/
└── translator.ts         cached machine translation
```
