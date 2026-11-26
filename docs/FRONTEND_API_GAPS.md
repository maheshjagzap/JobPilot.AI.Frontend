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
- Applications, preparation, approvals, submission, documents, recruiter contacts, campus drives, or automation history.
- Agent capabilities, tasks, conversations, messages, or run status.
- Automation run list/detail/cancellation/intervention.
- Integration status or connection-request persistence.
- Notifications and notification preferences.
- Appearance settings persisted on the backend.
- Activity/audit events.
- Billing, credits, referrals, or admin features.

## DTO mismatches and contract concerns

1. `lastName` is nullable in the live response/type contract.
2. Setup `password` requires a minimum length of 12 in OpenAPI.
3. The OpenAPI description says JWT bearer authorization is not enabled even though authentication responses include an access token.
4. Refresh-cookie shape and names are not represented in the live OpenAPI document.
5. Logout response is documented as `200 OK`, while proposed documentation uses `204 No Content`.
6. Proposed `Doc/*.md` endpoints must be reclassified from proposal to live only after live route verification.

## Frontend gaps

- Access auth response currently persists in `sessionStorage`; it must move to memory.
- Startup refresh and `me` restoration/loading state are missing.
- There is no coordinated single refresh request for concurrent 401 responses.
- There is no centralized RFC 7807/problem-details client covering query, upload, cancellation, and timeout behaviour.
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
