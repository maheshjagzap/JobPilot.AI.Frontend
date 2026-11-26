# Frontend API Integration Audit

**Audit date:** 2026-11-26  
**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Axios dependency  
**Verified live contract:** `https://localhost:7081/openapi/v1.json`

## 1. Route and page inventory

| Route | Component | Purpose | Current data source |
|---|---|---|---|
| `/login` | `pages/Login.tsx` | Initial setup or login | Live auth setup-status, setup, and login calls |
| `/agent` | `pages/AgentWorkspace.tsx` | Agent task workspace | Local command state; no backend task API |
| `/profile` | `pages/Profile.tsx` | Candidate profile sections | Browser localStorage drafts |
| `/resumes` | `pages/Resumes.tsx` | Resume and tailored document management | Unavailable; no API |
| `/jobs`, `/jobs/saved`, `/jobs/:jobId`, `/jobs/:jobId/match` | `pages/Jobs.tsx` | Search, saved jobs, detail, match | Unavailable; no API |
| `/applications`, `/applications/:applicationId` | `pages/Applications.tsx` | Pipeline and application details | Unavailable; no API |
| `/ai-apply`, `/ai-apply/:runId/review` | `pages/AIApply.tsx` | Preparation review and approval | Local checkbox state only |
| `/automation`, `/automation/:runId` | `pages/Automation.tsx` | Automation runs | Unavailable; no API |
| `/activity` | `pages/Activity.tsx` | Audit activity | Unavailable; no API |
| `/settings` | `pages/Settings.tsx` | Theme and connection preferences | localStorage only |
| `/dashboard` | Redirect to `/agent` | Dashboard placeholder | Redirect |

## 2. Shared implementation inventory

- **Router:** React Router 7.
- **Server state:** TanStack Query is installed but no feature hooks currently use it.
- **HTTP:** Authentication currently uses a custom `fetch` wrapper in `src/api/auth.ts`; many feature pages do not call APIs.
- **Auth UI state:** Access auth response is stored in `sessionStorage`, contrary to the approved memory-only requirement.
- **Theme:** Stored in `localStorage`.
- **Profile:** Each section uses browser drafts under `jobpilot-profile-*` keys.
- **Integrations:** `jobpilot-connection-request` stores provider choices in browser storage.
- **Demo mode:** `VITE_ENABLE_DEMO_MODE=true` bypasses route protection in development.
- **Mock/fake records:** The app does not fabricate records; unavailable states are explicit.

## 3. Live authentication contract

The live OpenAPI document currently exposes only six authentication endpoints.

| UI action | API method + route | Request DTO | Response DTO | Status |
|---|---|---|---|---|
| Read setup state | `GET /api/v1/auth/setup-status` | None | `SetupStatusResponse` | Partial |
| Create first owner | `POST /api/v1/auth/setup` | `SetupOwnerRequest` | `AuthenticationResponse` | Partial |
| Login | `POST /api/v1/auth/login` | `LoginRequest` | `AuthenticationResponse` | Partial |
| Refresh session | `POST /api/v1/auth/refresh` | None | `AuthenticationResponse` | Not coordinated |
| Logout | `POST /api/v1/auth/logout` | None | 200/no response contract | Partial |
| Get current owner | `GET /api/v1/auth/me` | None | `OwnerProfileResponse` | Partial |

Actual `AuthenticationResponse`: `accessToken`, `tokenType`, `expiresAt`, `owner { userId, email, firstName, lastName }`.

## 4. Page/action mapping and gaps

| Page/action | Live endpoint | Current status |
|---|---|---|
| Login/setup status | `GET setup-status` | Implemented; origin/proxy and rate-limit issues remain deployment concerns |
| Login/setup | `POST setup/login` | Implemented; should not persist access tokens |
| Logout | `POST logout` | Calls backend and clears browser auth fallback |
| Protected routes | `refresh/me` | Route guard checks `sessionStorage`; startup refresh and real loading guard missing |
| Profile loads/saves | No live route in OpenAPI | Browser drafts only |
| Jobs/search/detail/saved/match | No live route in OpenAPI | UI unavailable |
| Resumes/upload/download | No live route in OpenAPI | UI unavailable |
| Applications/details/preparation/submit | No live route in OpenAPI | UI unavailable |
| AI Apply | No live route in OpenAPI | UI unavailable |
| Agent tasks | No live route in OpenAPI | UI unavailable |
| Automation/runs | No live route in OpenAPI | UI unavailable |
| Activity | No live route in OpenAPI | UI unavailable |
| Settings theme/provider request | No live route in OpenAPI | Browser storage only |
| Dashboard | No live route in OpenAPI | Not routed; placeholder |

## 5. Existing UI fields and controls

- **Login:** email, password, optional setup first-name/last-name.
- **Profile:** personal, experience, education, projects, certifications, skills, preferences, relocation.
- **Jobs:** search, filters, saved/detail/match route variants.
- **Applications:** source tabs, campus drives, search, detail route.
- **AI Apply:** draft review table and explicit approval checkbox.
- **Resumes:** upload control currently disabled.
- **Agent:** command textarea and suggestion chips.
- **Settings:** theme, integration checkboxes, logout.

## 6. Identified issues

1. Access authentication response is stored in `sessionStorage`.
2. Demo mode is an unauthenticated route bypass and must remain development-only.
3. No startup refresh/me session restoration exists.
4. 401 refresh coordination is not implemented.
5. No central typed feature API client for non-auth endpoints.
6. Profile, theme, connection preferences, and auth state are browser-persisted.
7. There are no live dashboard, profile, job, resume, application, agent, automation, activity, integration, or notification routes in the current OpenAPI document.
8. Existing proposed `Doc/*.md` contracts are proposals and must not be treated as live until verified.
9. Loading, validation, 409/412/428, pagination, cancel, multipart, polling, and file-download patterns are not implemented where endpoints are absent.
10. The backend OpenAPI description says bearer auth is reserved and authentication is not currently enabled, but setup/login currently return access tokens in practice.

## 7. Initial blocked scope

Before broad page integration can proceed, the backend must provide or expose Version 2 routes and DTOs for profile, jobs, resumes, applications, agent/automation, settings/integrations, activity, notifications, billing, and any dashboard summary. The live OpenAPI document is the authoritative source for currently deployed endpoints.
