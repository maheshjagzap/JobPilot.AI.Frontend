# JobPilot AI Frontend

React + TypeScript + Vite frontend for the JobPilot AI personal job-search workspace.

## Status

The backend source and API contract are not present in this workspace. The frontend is fully routed and designed, but API-backed features intentionally remain unavailable. It does not fabricate jobs, metrics, profile records, application states, automation runs, or submission success.

## Install

Requires Node.js 20+ and npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the real ASP.NET Core API origin discovered from backend launch settings. Cookies require a compatible same-site localhost setup.

## Scripts

```powershell
npm run dev
npm run build
npm run lint
npm run test:run
npm run format:check
npm run preview
```

## Environment variables

- `VITE_APP_NAME`: Display name.
- `VITE_API_BASE_URL`: ASP.NET Core API base URL. No secret values.
- `VITE_ENABLE_DEMO_MODE`: Must remain false unless a backend-independent demo is explicitly added.
