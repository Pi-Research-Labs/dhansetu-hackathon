# DhanSetu Website

Backend API docs (base URL, auth, every endpoint): [`../API.md`](../API.md).
Live backend: `http://34.47.227.201:8000/api/v1` (up 9AM–9PM daily).

## Deployment

Live at **https://dhansetu-19e56.web.app** (Firebase Hosting, separate GCP
project from the VM — Hosting doesn't need to share infra with the backend).
Auto-deploys on push to `main` when `web/**` changes
(`.github/workflows/deploy-web.yml`).

Auth uses Workload Identity Federation, not a service account key — this
org has `constraints/iam.managed.disableServiceAccountKeyCreation` enforced,
so GitHub's own OIDC token is exchanged for short-lived GCP credentials
instead, scoped to just this repo (`Pi-Research-Labs/dhansetu-hackathon`) via
the workload identity pool's `attribute-condition`.

Manual deploy (needs `firebase-tools` and Google credentials with
`roles/firebasehosting.admin` or better on the `dhansetu-19e56` project):
```bash
cd web
npm run build
firebase deploy --only hosting --project=dhansetu-19e56
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
