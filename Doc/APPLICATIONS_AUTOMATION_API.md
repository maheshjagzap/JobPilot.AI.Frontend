# Applications, AI Apply, Automation, and Activity APIs

## Status and scope

**These are proposed API contracts, not live or verified backend endpoints.** The current Applications, AI Apply, Automation, and Activity pages display unavailable/empty states. No task, application, automation run, or activity record is fabricated or submitted by the frontend.

Base path: `/api/v1`  
JSON errors: `application/problem+json`  
Authentication: secure authenticated session.

This guide covers the essential lifecycle: inspect application records, prepare a draft, save reviewed answers, record explicit approval, submit only after approval, then inspect the verified automation run and audit events.

## Lifecycle and API relationships

1. APIs 1–2 show existing confirmed application records.
2. API 3 creates a draft from a real job, profile, and selected stored resume.
3. API 4 saves user-reviewed answers. It does not approve or submit.
4. API 5 records the user's explicit approval after the review screen. Approval is specific to one draft/version.
5. API 6 may submit only that approved version and returns a run reference. `202 Accepted` means the backend started work, not that the application was submitted.
6. API 7 lists automation runs; API 8 polls an individual run until it reaches a verified terminal state.
7. API 9 supplies the Activity page with backend audit events across supported features.

Related guides: [Agent APIs](./AGENT_API.md), [Candidate data APIs](./CANDIDATE_DATA_API.md), and [Job search APIs](./JOB_SEARCH_API.md).

## API 1 — List applications

**Purpose and use:** Populate the Applications pipeline with confirmed application records and support the source tabs/search.

**Request**

```http
GET /api/v1/applications?source=LinkedIn&status=interview&pageSize=20&cursor=
Accept: application/json
```

Filters such as `source`, `status`, and text query must use backend-defined values. The UI currently shows source options including LinkedIn, Naukri, Indeed, Gmail, company career pages, and All applications; confirm which are supported by the actual backend.

**Success — `200 OK`**

```json
{
  "items": [
    {
      "applicationId": "application_123",
      "jobId": "job_123",
      "company": "Example Company",
      "role": "Backend Engineer",
      "source": "company_site",
      "status": "interview",
      "appliedAt": "2026-11-20T08:00:00Z",
      "updatedAt": "2026-11-24T08:30:00Z"
    }
  ],
  "nextCursor": null
}
```

Only backend-confirmed records and status enums belong here. Do not mark an application submitted because a browser opened a form or attempted a click.

**Errors:** `400 Bad Request` for invalid filters; `401 Unauthorized`; `500 Internal Server Error`. An error must not be rendered as an empty successful list.

**Linked APIs:** API 2 loads one record; APIs 3–8 create and verify new records. API 9 supplies related activity events.

## API 2 — Get application details

**Purpose and use:** Load one application, its confirmed status history, and any safely displayable external reference when a user opens the detail route.

**Request**

```http
GET /api/v1/applications/application_123
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "applicationId": "application_123",
  "jobId": "job_123",
  "company": "Example Company",
  "role": "Backend Engineer",
  "source": "company_site",
  "status": "interview",
  "appliedAt": "2026-11-20T08:00:00Z",
  "events": [
    {
      "eventId": "event_456",
      "type": "status_confirmed",
      "occurredAt": "2026-11-24T08:30:00Z",
      "summary": "Application status updated to interview"
    }
  ]
}
```

Return only events visible to the signed-in user and omit secrets, provider cookies, and sensitive raw page content.

**Errors:** `401 Unauthorized`; `404 Not Found` for a missing or non-owned application.

**Linked APIs:** API 1 lists the record. API 6 may create an application after a confirmed submission. API 8 supplies automation events when applicable.

## API 3 — Prepare an application draft

**Purpose and use:** Start preparation for a selected real job using the user's profile and an existing resume. It creates a reviewable draft, not a submission.

**Request**

```http
POST /api/v1/application-preparations
Content-Type: application/json
Accept: application/json
Idempotency-Key: a14a49c4-5c48-4bfc-a403-a23709c905fc
```

```json
{
  "jobId": "job_123",
  "resumeId": "resume_123"
}
```

The backend should validate that the job and resume belong to or are available to the user. If a profile or resume is missing, return an actionable problem response rather than generating unsupported facts.

**Accepted — `202 Accepted`**

```json
{
  "preparationId": "preparation_123",
  "status": "preparing",
  "statusUrl": "/api/v1/application-preparations/preparation_123"
}
```

This response is not a completed application, and no external career page should be submitted at this stage.

**Errors:** `400 Bad Request`; `401 Unauthorized`; `404 Not Found` for unavailable job/resume; `409 Conflict` if an active preparation already exists.

**Linked APIs:** Uses a job from [Job Search APIs](./JOB_SEARCH_API.md) and candidate data from [Candidate data APIs](./CANDIDATE_DATA_API.md). Its resulting draft is updated through API 4 and reviewed through API 5.

## API 4 — Read and save an application draft

**Purpose and use:** Load the prepared answers for the review screen, then persist edits made by the user. A preparation may contain AI suggestions, but every answer and its source must be visible before approval.

**Read request**

```http
GET /api/v1/application-preparations/preparation_123
Accept: application/json
```

**Read success — `200 OK`**

```json
{
  "preparationId": "preparation_123",
  "jobId": "job_123",
  "resumeId": "resume_123",
  "version": 3,
  "status": "draft",
  "answers": [
    {
      "field": "work_authorization",
      "value": "",
      "source": "not_provided",
      "sensitive": true,
      "confirmedByUser": false
    }
  ],
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

The review page must mark sensitive or legal questions (work authorization, sponsorship, salary, declarations, consent) for user review. Do not infer missing facts.

**Read errors:** `401 Unauthorized`; `404 Not Found` for an inaccessible preparation.

**Save request**

```http
PUT /api/v1/application-preparations/preparation_123
Content-Type: application/json
Accept: application/json
If-Match: "3"
```

```json
{
  "answers": [
    {
      "field": "work_authorization",
      "value": "Requires user confirmation",
      "source": "user_input",
      "confirmedByUser": true
    },
    {
      "field": "salary_expectation",
      "value": "",
      "source": "not_provided",
      "confirmedByUser": false
    }
  ]
}
```

`If-Match` identifies the draft version being edited.

**Save success — `200 OK`**

```json
{
  "preparationId": "preparation_123",
  "version": 4,
  "status": "draft",
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Save errors:** `400 Bad Request` for invalid fields; `401 Unauthorized`; `412 Precondition Failed` for a stale draft version. A version conflict requires reloading and reconciling changes.

**Linked APIs:** API 3 creates the draft. API 5 approves a specific saved version. API 6 must reject an outdated or unapproved version.

## API 5 — Record explicit user approval

**Purpose and use:** Record the user's explicit approval after the application review page displays the company, role, documents, every proposed answer, sensitive fields, and relevant consent declarations.

**Request**

```http
POST /api/v1/application-preparations/preparation_123/approval
Content-Type: application/json
Accept: application/json
```

```json
{
  "approvedVersion": 4,
  "confirmation": "I reviewed the application and approve this version for submission."
}
```

This endpoint should only be called after a direct user action in the review UI. The agent must never call it on the user's behalf. Approval is limited to the exact draft version and purpose shown.

**Success — `201 Created`**

```json
{
  "approvalId": "approval_789",
  "preparationId": "preparation_123",
  "approvedVersion": 4,
  "approvedAt": "2026-11-24T08:31:00Z",
  "expiresAt": "2026-11-24T09:31:00Z"
}
```

Approval is not submission. Any change to the draft after approval invalidates that approval and requires another review.

**Errors:** `400 Bad Request` for missing confirmation; `401 Unauthorized`; `409 Conflict` if the draft changed or is not ready for approval.

**Linked APIs:** API 4 saves the reviewed version. API 6 requires a valid approval ID and matching draft version.

## API 6 — Submit an approved application

**Purpose and use:** Ask the backend automation service to submit the exact approved application, only where the provider and target site support the action.

**Request**

```http
POST /api/v1/application-preparations/preparation_123/submissions
Content-Type: application/json
Accept: application/json
Idempotency-Key: 429ff900-38c3-492c-8a08-97d2551fc1a1
```

```json
{
  "approvalId": "approval_789",
  "approvedVersion": 4
}
```

The backend must validate ownership, approval freshness, exact draft version, and provider support before doing anything externally visible.

**Accepted — `202 Accepted`**

```json
{
  "runId": "run_123",
  "status": "queued",
  "statusUrl": "/api/v1/automation/runs/run_123"
}
```

This only confirms that work was queued. It does not confirm that an application was submitted.

**Errors:** `400 Bad Request`; `401 Unauthorized`; `409 Conflict` for missing, expired, or mismatched approval; `422 Unprocessable Content` when the site/provider cannot safely proceed; `503 Service Unavailable`.

**Linked APIs:** API 5 supplies approval. API 7 tracks execution. API 1/2 should show a new submitted application only after verified backend confirmation.

## API 7 — List automation runs

**Purpose and use:** Populate Automation Activity with the user's runs and their current status, so the user can open an individual run.

**Request**

```http
GET /api/v1/automation/runs?status=running&pageSize=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "runId": "run_123",
      "preparationId": "preparation_123",
      "status": "running",
      "startedAt": "2026-11-24T08:32:00Z",
      "updatedAt": "2026-11-24T08:33:00Z"
    }
  ],
  "nextCursor": null
}
```

**Errors:** `400 Bad Request` for invalid filters; `401 Unauthorized`.

**Linked APIs:** API 6 creates a run. Open a row with API 8. API 9 can show related audit activity.

## API 8 — Get automation run status

**Purpose and use:** Power the Automation Run page and show safe, auditable progress for a user-approved run.

**Request**

```http
GET /api/v1/automation/runs/run_123
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "runId": "run_123",
  "preparationId": "preparation_123",
  "status": "waiting_for_user",
  "currentStep": "External site requires manual verification",
  "startedAt": "2026-11-24T08:32:00Z",
  "updatedAt": "2026-11-24T08:33:00Z",
  "applicationId": null,
  "events": [
    {
      "eventId": "event_789",
      "type": "manual_intervention_required",
      "occurredAt": "2026-11-24T08:33:00Z",
      "summary": "Complete the required verification directly on the provider site"
    }
  ]
}
```

Possible statuses should be confirmed by the backend, for example `queued`, `running`, `waiting_for_user`, `completed`, `failed`, and `cancelled`. Only a verified completion response should include a confirmed `applicationId` and submitted outcome.

**Errors:** `401 Unauthorized`; `404 Not Found` for a missing or non-owned run.

**Linked APIs:** API 6 creates the run; API 7 lists it. API 2 provides the application record after a confirmed submission. API 9 supplies system-wide activity.

## API 9 — List activity events

**Purpose and use:** Populate Activity Centre with verified, user-visible events such as job discovery, profile/resume changes, application approvals, confirmed submissions, and automation failures.

**Request**

```http
GET /api/v1/activity?category=applications&pageSize=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "eventId": "event_789",
      "category": "applications",
      "type": "submission_confirmed",
      "occurredAt": "2026-11-24T08:33:00Z",
      "summary": "Application submission confirmed",
      "applicationId": "application_123",
      "runId": "run_123"
    }
  ],
  "nextCursor": null
}
```

The backend owns category and type enums. Summaries must not expose credentials, cookies, full resume text, or unnecessary sensitive answers. A queued task or attempted action must not appear as a confirmed success event.

**Errors:** `400 Bad Request` for invalid filters; `401 Unauthorized`; `500 Internal Server Error`. Show an error state if the feed fails instead of claiming there is no activity.

**Linked APIs:** API 1 and API 2 provide application records and details; APIs 7–8 provide automation run context. The agent may cause events only through verified backend actions described in [Agent APIs](./AGENT_API.md).

## Safety rules

- Explicit approval is required for every individual final submission; batch approval must not silently approve several applications.
- CAPTCHA, MFA, credentials, cookies, and anti-bot controls must not be exposed or bypassed. Pause and ask the user to complete any required manual step.
- An attempted form fill, queued run, or opened page is not a submitted application.
- Keep an auditable record of preparation version, approval, run state, verified result, and failure reason without logging secrets or unnecessary sensitive answers.
- Activity events must be server-generated from verified outcomes rather than client-generated success messages.
