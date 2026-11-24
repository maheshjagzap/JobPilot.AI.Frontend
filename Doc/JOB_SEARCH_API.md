# Job Search APIs

## Status and scope

**These are proposed API contracts, not live or verified backend endpoints.** The current Jobs page displays unavailable states and does not search, save, load job details, or calculate matches. Verify real job-source integrations, permissions, DTOs, and matching rules before implementation.

Base path: `/api/v1`  
JSON errors: `application/problem+json`  
Authentication: secure authenticated session.

## How these APIs are used

Use API 1 for discovery and filters; API 2 for the Saved Jobs view; API 3 to add/remove a saved job; API 4 for a selected job; and API 5 to display a backend-calculated match explanation. The agent can invoke the same capabilities when requested by the user; it should not invent jobs or scores.

Related guides: [Agent APIs](./AGENT_API.md), [Candidate data APIs](./CANDIDATE_DATA_API.md), and [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 1 — Search discovered jobs

**Purpose and use:** Search supported sources using the user's query and filters. This powers the Discover Jobs search field and results list.

**Request**

```http
GET /api/v1/jobs?q=backend&location=Toronto&workMode=remote&pageSize=20&cursor=
Accept: application/json
```

Supported query parameters depend on the verified backend. Candidates may include `q`, `location`, `workMode`, `employmentType`, `postedAfter`, `pageSize`, and `cursor`; do not send or display filters the API does not support.

**Success — `200 OK`**

```json
{
  "items": [
    {
      "jobId": "job_123",
      "title": "Backend Engineer",
      "company": "Example Company",
      "location": "Toronto, Canada",
      "workMode": "remote",
      "source": "company_site",
      "sourceUrl": "https://example.com/careers/role",
      "postedAt": "2026-11-20T08:00:00Z",
      "saved": false
    }
  ],
  "nextCursor": null
}
```

Only present a result if the backend retrieved it from a supported source. Include source/last-verified information where available; do not imply completeness across all job boards.

**Errors:** `400 Bad Request` for invalid filters; `401 Unauthorized`; `429 Too Many Requests` for source limits; `503 Service Unavailable` if discovery is unavailable. An error is not an empty result.

**Linked APIs:** API 2 lists saved jobs, API 3 changes the saved flag, API 4 retrieves details, and API 5 obtains match analysis. Application preparation in [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md) may refer to a returned `jobId`.

## API 2 — List saved jobs

**Purpose and use:** Populate the Saved Jobs screen from the user's saved records, optionally filtering by a search phrase.

**Request**

```http
GET /api/v1/jobs/saved?q=backend&pageSize=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "jobId": "job_123",
      "title": "Backend Engineer",
      "company": "Example Company",
      "location": "Toronto, Canada",
      "source": "company_site",
      "savedAt": "2026-11-24T08:30:00Z"
    }
  ],
  "nextCursor": null
}
```

**Errors:** `400 Bad Request` for invalid pagination; `401 Unauthorized`. A successful empty list means no saved jobs; a failed request should show an error state.

**Linked APIs:** API 3 changes a saved record; API 4 opens job details; API 5 can analyze a saved job.

## API 3 — Save or unsave a job

**Purpose and use:** Persist a user's explicit save/unsave action. Use a single idempotent operation so retries do not create duplicate saved records.

**Request**

```http
PUT /api/v1/jobs/job_123/saved
Content-Type: application/json
Accept: application/json
```

```json
{
  "saved": true
}
```

Set `saved` to `false` to remove it from the saved list.

**Success — `200 OK`**

```json
{
  "jobId": "job_123",
  "saved": true,
  "savedAt": "2026-11-24T08:30:00Z"
}
```

`savedAt` may be `null` when `saved` is false.

**Errors:** `400 Bad Request`; `401 Unauthorized`; `404 Not Found` if the job is no longer available. Update the UI only after the operation is confirmed or clearly show a pending/error state.

**Linked APIs:** API 2 reflects the changed list. API 1 may reflect the `saved` flag. API 4 and API 5 consume the same job ID.

## API 4 — Get job details

**Purpose and use:** Load a single discovered opportunity when the user opens a job detail route.

**Request**

```http
GET /api/v1/jobs/job_123
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "jobId": "job_123",
  "title": "Backend Engineer",
  "company": "Example Company",
  "location": "Toronto, Canada",
  "workMode": "remote",
  "employmentType": "full_time",
  "description": "Description retrieved from the verified source.",
  "requirements": ["Experience building backend APIs"],
  "source": "company_site",
  "sourceUrl": "https://example.com/careers/role",
  "lastVerifiedAt": "2026-11-24T08:30:00Z",
  "saved": false
}
```

The backend owns the actual enums and content policy. Escape/sanitize rendered source content.

**Errors:** `401 Unauthorized`; `404 Not Found` if removed or inaccessible. Do not substitute fabricated details.

**Linked APIs:** API 3 updates the saved flag; API 5 requests match analysis. Application preparation may use this job ID.

## API 5 — Get job match analysis

**Purpose and use:** Request a transparent comparison of one job against the user's actual profile. This powers the Match Analysis route.

**Request**

```http
GET /api/v1/jobs/job_123/match
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "jobId": "job_123",
  "profileVersion": 8,
  "score": 78,
  "summary": "Several required backend skills are supported by the profile.",
  "matchedRequirements": ["Backend API experience"],
  "gaps": ["Cloud deployment experience was not found in the profile"],
  "calculatedAt": "2026-11-24T08:30:00Z"
}
```

The score and reasons must be calculated by the backend's documented matching logic. Missing data should be identified as unknown, not treated as either a match or a failure.

**Errors:** `401 Unauthorized`; `404 Not Found` for a job/profile; `409 Conflict` if profile data changed during calculation. A missing profile should prompt the user to complete it.

**Linked APIs:** API 4 identifies the job; the analysis uses the profile from [Candidate data APIs](./CANDIDATE_DATA_API.md). [Agent APIs](./AGENT_API.md) may summarize this returned analysis without changing its facts.
