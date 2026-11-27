# Backend API Implementation Guide

## Status

This guide is a proposed backend contract based on the current frontend and its API proposals. **Only the authentication routes in the first table are verified as live.** Every other route below, including routes in linked API guides, needs backend review and OpenAPI confirmation before it is treated as implemented.

Base path: `/api/v1`  
Authentication: authenticated owner session; authorize every resource by its owner.  
Errors: use `application/problem+json` with a stable `title`, `status`, and actionable `detail`.

## Verified live routes

These are the only routes verified by the current live OpenAPI document:

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/auth/setup-status` | None | `200` with `{ "setupRequired": true }` |
| `POST` | `/auth/setup` | Owner email, password, first and last name | `200` with authentication response |
| `POST` | `/auth/login` | Email and password | `200` with authentication response |
| `POST` | `/auth/refresh` | Refresh cookie/session | `200` with authentication response |
| `POST` | `/auth/logout` | Refresh cookie/session | `200`, no response body contract |
| `GET` | `/auth/me` | Authenticated session | `200` with owner profile |

Authentication response shape:

```json
{
  "accessToken": "opaque-or-jwt-access-token",
  "tokenType": "Bearer",
  "expiresAt": "2026-11-24T08:30:00Z",
  "owner": {
    "userId": "user_123",
    "email": "alex@example.com",
    "firstName": "Alex",
    "lastName": "Morgan"
  }
}
```

Confirm the actual status codes, refresh-cookie policy, and whether protected endpoints use bearer tokens or cookies against the backend OpenAPI before implementation. In particular, the live logout response is documented as `200`; do not implement the proposed `204` response from older documentation without changing the backend contract.

## Proposed endpoint catalog

The linked guides contain request/response examples and endpoint behavior for the main feature APIs:

| Feature | Endpoints | Detailed contract |
|---|---|---|
| Candidate profile and resumes | `GET/PUT /profile`; `GET/POST /resumes`; `GET /resumes/{resumeId}/download` | [Candidate Data APIs](./CANDIDATE_DATA_API.md) |
| Jobs | `GET /jobs`; `GET /jobs/saved`; `PUT /jobs/{jobId}/saved`; `GET /jobs/{jobId}`; `GET /jobs/{jobId}/match` | [Job Search APIs](./JOB_SEARCH_API.md) |
| Applications and preparation | `GET /applications`; `GET /applications/{applicationId}`; `POST /application-preparations`; `GET/PUT /application-preparations/{preparationId}`; approval and submission routes | [Applications and Automation APIs](./APPLICATIONS_AUTOMATION_API.md) |
| Automation and activity | `GET /automation/runs`; `GET /automation/runs/{runId}`; `GET /activity` | [Applications and Automation APIs](./APPLICATIONS_AUTOMATION_API.md) |
| Settings and integrations | `GET/PUT /settings`; `GET /integrations`; `PUT /integrations/connection-request`; logout | [Settings APIs](./SETTINGS_API.md) |

The following contracts cover UI/backend gaps not detailed in those guides. Add or change them only after confirming product scope and the final OpenAPI schema.

## What is needed for the current feature scope

The six authentication routes above are the only APIs the frontend currently calls. To make the existing feature pages work with backend data, implement the proposed APIs in the linked guides:

- Profile: `GET/PUT /api/v1/profile`.
- Resumes: `GET/POST /api/v1/resumes` and `GET /api/v1/resumes/{resumeId}/download`.
- Jobs: search, saved jobs, save/unsave, details, and match analysis.
- Applications: list/details, preparation create/read/update, explicit approval, and submission.
- Automation/activity: run list/status and activity feed.
- Settings/integrations: appearance read/update and connection status/request; logout is already live.

Those route shapes, payload examples, and behavior are in the linked feature guides above; this file is an index plus additional contracts, not a replacement for them. The current frontend does not call any feature API yet, so implement and integrate these in feature-sized increments rather than treating every proposal as already required by the live UI.

## API implementation and document change map

Use this list to decide what to build in the C# REST backend and where to update the contract. A route is still a proposal until it appears in the backend OpenAPI document and has been verified against the running API.

| Priority | Backend API area | APIs to implement or verify | Contract document to update |
|---|---|---|---|
| 1 | Authentication | Verify the six live `/auth/*` routes, response DTOs, access-token transport, refresh-cookie behavior, CORS, and CSRF policy. No new auth routes are proposed here. | `docs/FRONTEND_API_GAPS.md` for verified contract findings; `docs/FRONTEND_API_IMPLEMENTATION_TRACKER.md` for frontend integration status. |
| 2 | Candidate profile | `GET/PUT /api/v1/profile`, including validation and repeatable child records. | `Doc/CANDIDATE_DATA_API.md` |
| 2 | Resumes | `GET/POST /api/v1/resumes` and secure download from `Doc/CANDIDATE_DATA_API.md`; add `GET /resumes/{resumeId}`, `PUT /resumes/{resumeId}/primary`, and `POST /resumes/{resumeId}/archive` from this guide to that same resume contract before implementing them. | `Doc/CANDIDATE_DATA_API.md` (consolidate the additional resume routes currently specified below). |
| 3 | Jobs | Search/filter/pagination, saved-job list and save/unsave, job detail, and match analysis. | `Doc/JOB_SEARCH_API.md` |
| 4 | Applications | List/detail, create and update a preparation draft, record explicit approval for the exact draft version, and submit only after approval. | `Doc/APPLICATIONS_AUTOMATION_API.md` |
| 5 | Automation and activity | List runs, read run status, and list activity events. Add cancellation only when the UI exposes a cancel action and the worker can safely honor it. | `Doc/APPLICATIONS_AUTOMATION_API.md` (the cancellation proposal is currently in this guide). |
| 6 | Settings and integrations | Read/update appearance, read integration status, and save a connection request. Logout already exists under authentication; provider OAuth is a later, separate consent flow. | `Doc/SETTINGS_API.md` |

The following are not part of the current implementation sequence: dashboard summary, notifications/preferences, extended resume controls until their UI is available, automation cancellation until there is a cancel control, billing, credits, referrals, and admin APIs. Keep their proposals in this guide or promote them to a feature contract only when the product scope and UI are approved.

Agent capability/task/conversation APIs in `Doc/AGENT_API.md` are explicitly out of scope for this C# REST API implementation. Do not add agent controllers, endpoints, DTOs, or agent-service dependencies as part of the rows above. The Agent Workspace can remain unavailable until a separate agent-service project is approved. Campus-drive discovery is also excluded from the current REST scope because the existing UI delegates it to the agent; if it becomes a direct REST feature, define its own non-agent contract in a later change.

## Can be deferred

These are proposals, not blockers for the currently visible frontend flows:

- Dashboard summary: `/dashboard` currently redirects to `/agent`; no dashboard summary screen consumes this response.
- Notifications and notification preferences: there is no notification UI yet.
- Resume detail, primary selection, and archive: the current Resumes page has no controls for these actions.
- Automation cancellation: the current Automation page has no cancel control.
- Provider OAuth authorization/callback/revoke: the Settings page only saves connection requests and displays statuses. Real account linking needs a separate consent-based provider flow when that feature is built.
- Agent service/task APIs: these are described separately in [Agent APIs](./AGENT_API.md), but are **out of scope** for the current C# REST API backend work.
- Billing, credits, referrals, and admin routes: no corresponding frontend feature is currently present.

The “Upcoming campus drives” UI currently delegates to the agent, so it is also outside the current backend REST API scope. If campus drives are needed before an agent service exists, define a dedicated non-agent REST contract for them later.

## Dashboard summary

### `GET /api/v1/dashboard/summary`

**Purpose and logic:** Return a compact, owner-scoped summary for the dashboard. Counts must be derived from persisted, verified backend records. Do not count queued work as a successful application or invent profile completeness. If a data source is unavailable, return an explicit partial/unavailable state rather than a fabricated zero.

**Request**

```http
GET /api/v1/dashboard/summary
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "generatedAt": "2026-11-24T08:30:00Z",
  "profile": {
    "completionPercent": 72,
    "missingFields": ["phone", "targetRoles"]
  },
  "jobs": {
    "savedCount": 8
  },
  "applications": {
    "totalCount": 12,
    "byStatus": {
      "draft": 1,
      "submitted": 7,
      "interview": 2,
      "rejected": 2
    }
  },
  "resumes": {
    "totalCount": 2,
    "primaryResumeId": "resume_123"
  },
  "recentActivity": [],
  "dataStatus": {
    "profile": "available",
    "jobs": "available",
    "applications": "available",
    "resumes": "available"
  }
}
```

`completionPercent` is based on a documented backend rule set. Define status values and whether archived/deleted records count. If the dashboard service cannot obtain one section, it may still return `200` with that section's `dataStatus` set to `unavailable` and the section marked `null`; it must not return a misleading zero for unavailable data.

**Errors:** `401 Unauthorized`; `500 Internal Server Error` if the summary itself cannot be produced. The frontend should distinguish an unavailable section from a real empty count.

## Resume management additions

The existing [Candidate Data APIs](./CANDIDATE_DATA_API.md) define listing, upload, and download. These routes add individual metadata, primary-resume selection, and archive behavior.

### `GET /api/v1/resumes/{resumeId}`

**Purpose and logic:** Return metadata for one resume owned by the authenticated user. Never return file bytes or a public storage URL from this endpoint.

**Request**

```http
GET /api/v1/resumes/resume_123
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "resumeId": "resume_123",
  "fileName": "resume.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 184200,
  "kind": "source",
  "status": "ready",
  "primary": true,
  "createdAt": "2026-11-24T08:30:00Z",
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Errors:** `401 Unauthorized`; `404 Not Found` for missing, archived, or non-owned records.

### `PUT /api/v1/resumes/{resumeId}/primary`

**Purpose and logic:** Set this resume as the owner's single primary resume. Perform the change atomically so no owner can have two primary resumes. Reject resumes still processing or failed.

**Request**

```http
PUT /api/v1/resumes/resume_123/primary
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "resumeId": "resume_123",
  "primary": true,
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Errors:** `401 Unauthorized`; `404 Not Found` for missing/non-owned records; `409 Conflict` if the resume is not ready to use.

### `POST /api/v1/resumes/{resumeId}/archive`

**Purpose and logic:** Soft-archive a resume so it is hidden from the normal list and cannot be selected for new applications. Preserve records required by existing application audit history. Archiving the primary resume must either select no primary or require the user to select another; define one policy consistently.

**Request**

```http
POST /api/v1/resumes/resume_123/archive
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "resumeId": "resume_123",
  "status": "archived",
  "archivedAt": "2026-11-24T08:30:00Z"
}
```

Make repeated archive requests idempotent. Exclude archived records from the default list, and return `404` for their download/detail routes unless an explicit restore feature is added.

**Errors:** `401 Unauthorized`; `404 Not Found` for missing/non-owned records; `409 Conflict` if policy prevents archiving (for example, an active process is using it).

## Automation cancellation

### `POST /api/v1/automation/runs/{runId}/cancel`

**Purpose and logic:** Request cancellation of an owner-scoped run. This asks the backend to stop at a safe checkpoint; it must not claim cancellation until the worker confirms it. Do not interrupt an external submission at a point that could leave an ambiguous outcome. If it cannot safely cancel, retain the actual run state and explain why.

**Request**

```http
POST /api/v1/automation/runs/run_123/cancel
Accept: application/json
Idempotency-Key: 2f9f1c84-0e61-48ba-b788-0e908a4c6a9c
```

No request body.

**Accepted — `202 Accepted`**

```json
{
  "runId": "run_123",
  "status": "cancelling",
  "statusUrl": "/api/v1/automation/runs/run_123"
}
```

Poll `statusUrl` using the run detail endpoint. Only report `cancelled` when confirmed by the worker. Repeated requests with the same idempotency key must not create duplicate cancellation work.

**Errors:** `401 Unauthorized`; `404 Not Found` for missing/non-owned runs; `409 Conflict` if the run is already terminal or cannot be safely cancelled.

## Notifications

Notification records must be generated by trusted backend events, scoped to their owner, and contain no secrets or unnecessary sensitive application/profile data.

### `GET /api/v1/notifications`

**Purpose and logic:** List notifications newest-first with cursor pagination. `unreadOnly` defaults to `false`; an empty successful list means there are no matching notifications.

**Request**

```http
GET /api/v1/notifications?unreadOnly=true&pageSize=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "notificationId": "notification_123",
      "type": "application_status_changed",
      "title": "Application status updated",
      "message": "An application status has changed.",
      "readAt": null,
      "createdAt": "2026-11-24T08:30:00Z",
      "resource": {
        "type": "application",
        "id": "application_123"
      }
    }
  ],
  "unreadCount": 1,
  "nextCursor": null
}
```

The backend owns the `type` enum. `resource` is optional and must only point to a resource the current user can access.

**Errors:** `400 Bad Request` for invalid page size/cursor; `401 Unauthorized`. A failed request must not be shown as an empty notification list.

### `POST /api/v1/notifications/{notificationId}/read`

**Purpose and logic:** Mark one owner-scoped notification as read. Idempotent: marking an already-read notification succeeds without changing its original `readAt`.

**Request**

```http
POST /api/v1/notifications/notification_123/read
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "notificationId": "notification_123",
  "readAt": "2026-11-24T08:35:00Z"
}
```

**Errors:** `401 Unauthorized`; `404 Not Found` for missing/non-owned notifications.

### `POST /api/v1/notifications/read-all`

**Purpose and logic:** Mark all currently unread notifications belonging to the owner as read in one transaction. Notifications created after the request begins remain unread.

**Request**

```http
POST /api/v1/notifications/read-all
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "updatedCount": 4,
  "readAt": "2026-11-24T08:35:00Z"
}
```

Calling this when there are no unread records succeeds with `updatedCount: 0`.

**Errors:** `401 Unauthorized`; `500 Internal Server Error`.

### `GET /api/v1/notification-preferences`

**Purpose and logic:** Return persisted in-app notification preferences. Defaults must be defined server-side and returned explicitly rather than assumed by the frontend.

**Request**

```http
GET /api/v1/notification-preferences
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "inAppEnabled": true,
  "categories": {
    "applications": true,
    "automation": true,
    "jobs": true,
    "account": true
  },
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Errors:** `401 Unauthorized`; `500 Internal Server Error`.

### `PUT /api/v1/notification-preferences`

**Purpose and logic:** Replace the owner's preference resource. Validate category names against the backend-supported set and persist atomically.

**Request**

```http
PUT /api/v1/notification-preferences
Content-Type: application/json
Accept: application/json
```

```json
{
  "inAppEnabled": true,
  "categories": {
    "applications": true,
    "automation": false,
    "jobs": true,
    "account": true
  }
}
```

**Success — `200 OK`**

```json
{
  "inAppEnabled": true,
  "categories": {
    "applications": true,
    "automation": false,
    "jobs": true,
    "account": true
  },
  "updatedAt": "2026-11-24T08:35:00Z"
}
```

**Errors:** `400 Bad Request` for invalid or unknown categories; `401 Unauthorized`.

## Shared implementation rules

- Use UTC ISO-8601 timestamps and stable resource IDs.
- For paginated collections, consistently use `pageSize`, opaque `cursor`, and nullable `nextCursor`; cap page size server-side.
- Return `401` for missing/expired authentication and `404` for both missing and non-owned resources to avoid leaking ownership.
- Use `400` for invalid input, `409` for state conflicts, `412` for stale `If-Match` versions, and `429` for rate limits. Include field errors in problem details where applicable.
- Enforce owner authorization on every read and write, including nested resources and cursor pagination.
- Mutations that may be retried after a network failure should be idempotent or accept an `Idempotency-Key`.
- Define status/category enums in OpenAPI. Do not treat queued, attempted, or pending operations as verified completion.
- Confirm each proposal against product requirements, database design, provider support, and security policy before implementing. Update the frontend API tracker only after the backend route is live and verified.
