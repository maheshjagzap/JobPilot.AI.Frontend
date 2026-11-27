# Frontend API Gaps

## Verified live routes

Only these paths are verified in the current live OpenAPI document:

- `GET /api/v1/auth/setup-status`
- `POST /api/v1/auth/setup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Missing frontend/backend routes

No live OpenAPI routes are currently verified for:

- Dashboard summaries or metrics.
- Candidate profile CRUD, including repeatable child records.
- Job discovery, detail, saved jobs, filtering, pagination, or matching.
- Resume list, upload, status, download, default, or archive.
- Applications, preparation, approvals, submission, documents, recruiter contacts, or automation history. Campus-drive discovery is not currently contracted; if needed, define it as a separate non-agent REST API.
- Agent capabilities, tasks, conversations, messages, or run status (out of scope for current C# REST API work; separate agent-service proposal only).
- Automation run list/detail/cancellation/intervention.
- Integration status or connection-request persistence.
- Notifications and notification preferences.
- Appearance settings persisted on the backend.
- Activity/audit events.
- Billing, credits, referrals, or admin features.

## Backend implementation contracts

Request/response examples and behavior for proposed routes are documented in:

- [Backend API Implementation Guide](../Doc/BACKEND_API_IMPLEMENTATION_GUIDE.md) — verified-auth route inventory plus dashboard, resume management, automation cancellation, and notifications contracts.
- [Candidate Data APIs](../Doc/CANDIDATE_DATA_API.md) — profile and resume list/upload/download.
- [Job Search APIs](../Doc/JOB_SEARCH_API.md) — discovery, saved jobs, details, and matching.
- [Applications and Automation APIs](../Doc/APPLICATIONS_AUTOMATION_API.md) — applications, preparation, approval, submission, runs, and activity.
- [Agent APIs](../Doc/AGENT_API.md) — separate proposal for a future agent service; do not include it in current C# REST implementation.
- [Settings APIs](../Doc/SETTINGS_API.md) — appearance and integration preferences.

These are proposed contracts, not evidence that the backend routes exist. Confirm request/response DTOs, status codes, authorization, and enums in the backend OpenAPI before the frontend integrates them.

## DTO mismatches and contract concerns

1. `lastName` is nullable in the live response/type contract.
2. Setup `password` requires a minimum length of 12 in OpenAPI.
3. The OpenAPI description says JWT bearer authorization is not enabled even though authentication responses include an access token.
4. Refresh-cookie shape and names are not represented in the live OpenAPI document.
5. Logout is documented as `200 OK` with no response body contract; keep the proposed Settings API aligned with that live contract.
6. Proposed `Doc/*.md` endpoints must be reclassified from proposal to live only after live route verification.

## Frontend gaps

- Access auth response is held in memory; verify this remains the only access-token storage.
- Startup refresh and `me` restoration are implemented; add focused auth tests and verify backend cookie behavior.
- Concurrent 401 responses share a single refresh request and retry once; verify failure/replay cases against the backend contract.
- There is no shared typed feature API client for query, upload, cancellation, and file-download behavior. The auth wrapper has basic error handling but does not provide complete RFC 7807 handling for feature APIs.
- Profile sections and integration preferences are browser-only drafts.
- Theme is browser-only and can diverge from a server preference.
- UI route variants for dashboards and detail pages exist, but there are no live endpoints backing them.

## Security decisions required

The backend owner must confirm:

- Exact refresh cookie name, secure/same-site/http-only flags, expiry, and replay/revoke behaviour.
- Allowed frontend origins for `5173`, production origin, and Swagger origin.
- Whether access tokens are accepted by protected endpoints or auth is cookie-only.
- Whether CSRF protection is required for cookie-authenticated mutations.
- Production HTTPS and API base URL deployment configuration.

## Not to be fabricated

The frontend must not fabricate profile completeness, job matches, application state, submission success, task progress, automation success, account linkage, notification counts, or payment state without live confirmed backend endpoints.
