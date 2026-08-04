# DhanSetu

Hackathon monorepo with three projects:

- **`backend/`** — FastAPI backend (Python 3.13)
- **`mobile/`** — React Native app (Expo, expo-router, NativeWind, Redux Toolkit + redux-persist, React Query)
- **`web/`** — Website (Next.js + TypeScript)

Each folder has its own README with setup instructions.

**API docs for `mobile`/`web` to consume the backend: [`API.md`](API.md)** —
base URL, auth flow, every endpoint with example requests/responses. The
backend is live on the GCP VM at `https://dhansetu-api.piresearchlabs.com/api/v1`
(9AM–9PM daily; see `API.md` for local dev alternative).

**What the product actually does, end-to-end: [`STORY.md`](STORY.md)** —
the merchant's and field officer's journeys through the real demo data, and
the value delivered at each step. Schema reference (tables, views, login
credentials): [`database/SCHEMA.md`](database/SCHEMA.md). KPIs for both
sides and their DB source: [`KPIS.md`](KPIS.md) — or, for a plain-language,
board/investor-facing version of the same KPIs:
[`EXECUTIVE_BRIEF.md`](EXECUTIVE_BRIEF.md).
