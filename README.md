# DhanSetu

Hackathon monorepo with three projects:

- **`backend/`** — FastAPI backend (Python 3.13)
- **`mobile/`** — React Native app (Expo, expo-router, NativeWind, Redux Toolkit + redux-persist, React Query)
- **`web/`** — Website (Vite + React + TypeScript)

Each folder has its own README with setup instructions.

**API docs for `mobile`/`web` to consume the backend: [`API.md`](API.md)** —
base URL, auth flow, every endpoint with example requests/responses. The
backend is live on the GCP VM at `http://34.100.152.235:8000/api/v1`
(9AM–9PM daily; see `API.md` for local dev alternative).
