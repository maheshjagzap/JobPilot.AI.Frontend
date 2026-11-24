# JobPilot AI Frontend

React + TypeScript + Vite frontend for the JobPilot AI personal job-search workspace.

## Status

The backend source and API contract are not present in this workspace. The frontend provides an agent-first workspace and secondary screens, but task execution and API-backed features intentionally remain unavailable. It does not fabricate jobs, metrics, profile records, application states, agent progress, or submission success.

## Install

Requires Node.js 20+ and npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the real ASP.NET Core API origin discovered from backend launch settings. Cookies require a compatible same-site localhost setup.

## Local UI preview without a backend

For local development only, set `VITE_ENABLE_DEMO_MODE=true` to open the workspace without backend authentication. The bypass is guarded by Vite's development mode and is not enabled in production builds. This only previews the UI; agent commands are not sent and no backend data is created or confirmed. Keep the setting `false` when authentication is implemented.

Profile sections can be saved independently as local browser drafts. These drafts stay on the current browser/device and are not synced to an account or backend. Clear them from the browser's site data when needed.

The Skills section supports multiple entries. Settings can store a local request for future Naukri, Gmail, LinkedIn, Indeed, or other-provider linking; this is only an opt-in preference, not an active connection. Actual account linking requires secure backend authorization flows.

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
- `VITE_ENABLE_DEMO_MODE`: Enables local UI preview only in development; keep false by default.
