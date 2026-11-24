# Candidate Profile and Resume APIs

## Status and scope

**These are proposed API contracts, not live or verified backend endpoints.** The current Profile page saves section drafts in this browser only. The Resumes page has no upload, list, or download integration. Confirm the real backend DTOs, validation rules, storage policy, and file limits before implementing these proposals.

Base path: `/api/v1`  
JSON errors: `application/problem+json`  
Authentication: secure authenticated session.

## How these APIs are used

The profile is the source of candidate-provided facts used by job matching and application preparation. Resume metadata is associated with secure files. Load profile and resume data before offering those downstream actions; never fill missing details with invented facts.

**Flow:** API 1 loads the profile; API 2 saves profile edits; APIs 3–5 manage resume metadata and private file access. Related guides: [Agent APIs](./AGENT_API.md), [Job search APIs](./JOB_SEARCH_API.md), and [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 1 — Get candidate profile

**Purpose and use:** Load the signed-in user's profile tabs and candidate context. The response includes only user-provided data and a version for conflict detection.

**Request**

```http
GET /api/v1/profile
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "profileId": "profile_123",
  "version": 7,
  "personal": {
    "fullName": "Alex Morgan",
    "preferredName": "Alex",
    "email": "alex@example.com",
    "phone": "",
    "city": "Toronto",
    "country": "Canada",
    "summary": "Backend engineer with experience building APIs."
  },
  "experience": [],
  "education": [],
  "certifications": [],
  "skills": [],
  "preferences": {
    "targetRoles": ["Backend Engineer"],
    "salaryMin": "",
    "salaryMax": "",
    "salaryCurrency": "CAD",
    "salaryPeriod": "Yearly",
    "workModes": ["Remote"]
  },
  "relocation": {
    "currentCountry": "Canada",
    "willingness": "Not specified",
    "authorization": "",
    "preferredLocations": []
  }
}
```

Experience entries include title, employer, location, start/end dates, current-role flag, and description. Education, certifications, and skills use the fields shown in the Profile UI. The example is illustrative, not a real user record.

**Errors:** `401 Unauthorized`; `404 Not Found` if a profile has not yet been created. A missing profile must be presented as empty/unavailable, not filled with sample data.

**Linked APIs:** API 2 updates profile data. Agent and matching flows may read this profile with the user's authorization.

## API 2 — Update candidate profile

**Purpose and use:** Save edits from the Profile tabs to the account rather than only to browser storage. The UI currently saves each tab independently; the backend may accept section-level updates through this endpoint.

**Request**

```http
PUT /api/v1/profile
Content-Type: application/json
Accept: application/json
If-Match: "7"
```

```json
{
  "personal": {
    "fullName": "Alex Morgan",
    "preferredName": "Alex",
    "email": "alex@example.com",
    "phone": "",
    "city": "Toronto",
    "country": "Canada",
    "summary": "Backend engineer with experience building APIs."
  },
  "experience": [],
  "education": [],
  "certifications": [],
  "skills": [],
  "preferences": {
    "targetRoles": ["Backend Engineer"],
    "salaryMin": "",
    "salaryMax": "",
    "salaryCurrency": "CAD",
    "salaryPeriod": "Yearly",
    "workModes": ["Remote"]
  },
  "relocation": {
    "currentCountry": "Canada",
    "willingness": "Not specified",
    "authorization": "",
    "preferredLocations": []
  }
}
```

`If-Match` carries the version returned by API 1. This protects a newer edit from being overwritten by a stale browser tab.

**Success — `200 OK`**

```json
{
  "profileId": "profile_123",
  "version": 8,
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Errors:** `400 Bad Request` for invalid fields (including negative salary or minimum greater than maximum); `401 Unauthorized`; `412 Precondition Failed` if the version changed. On `412`, reload and let the user resolve the conflict instead of silently overwriting data.

**Linked APIs:** API 1 supplies the profile and version. Profile data may be read by the Agent and Job Search APIs, and by application preparation in [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 3 — List resumes

**Purpose and use:** Populate the Documents page with actual stored resume records, including which is primary and whether a tailored version belongs to a job/application.

**Request**

```http
GET /api/v1/resumes?limit=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "resumeId": "resume_123",
      "fileName": "resume.pdf",
      "contentType": "application/pdf",
      "sizeBytes": 184200,
      "kind": "source",
      "status": "ready",
      "primary": true,
      "createdAt": "2026-11-24T08:30:00Z"
    }
  ],
  "nextCursor": null
}
```

`kind` may distinguish `source` from `tailored`; tailored records should reference the job or preparation that produced them when available. `status` may be `processing`, `ready`, or `failed`. Do not expose a public storage URL.

**Errors:** `401 Unauthorized`; `500 Internal Server Error`. Show an empty state only for a successful empty list; show an error state if the list could not be loaded.

**Linked APIs:** API 4 uploads a record; API 5 provides secure file access. Application preparation can use an existing resume ID.

## API 4 — Upload a resume

**Purpose and use:** Store a user-selected file and create a resume record. The backend must enforce file size/type limits, malware scanning, private storage, and ownership checks.

**Request**

```http
POST /api/v1/resumes
Content-Type: multipart/form-data
```

Form fields:

- `file`: required resume file bytes.
- `kind`: optional; `source` by default.
- `setAsPrimary`: optional boolean, only if supported by the backend.

The exact allowed MIME types and size limit must be returned by backend configuration; they are not defined by the current UI.

**Accepted — `202 Accepted`**

```json
{
  "resumeId": "resume_124",
  "fileName": "resume.pdf",
  "status": "processing"
}
```

`202` means upload/processing was accepted, not that parsing succeeded. Refresh API 3 to show the processing state and only show parsed fields when a later verified response provides them.

**Errors:** `400 Bad Request` for invalid metadata; `413 Content Too Large`; `415 Unsupported Media Type`; `401 Unauthorized`. The UI should show actionable validation errors and never claim an upload succeeded when it failed.

**Linked APIs:** API 3 refreshes the list. API 5 retrieves the file securely. Application preparation may reference the created `resumeId`.

## API 5 — Download a resume securely

**Purpose and use:** Allow the owner to preview or download a private file without publishing it as a static asset.

**Request**

```http
GET /api/v1/resumes/resume_123/download
```

**Success — `200 OK`**

The response streams the file with the correct `Content-Type` and a safe `Content-Disposition` filename. Alternatively, the backend may return a short-lived, single-purpose download URL; if so, it must be scoped to the current user/file and expire quickly.

**Errors:** `401 Unauthorized`; `404 Not Found` for a missing or non-owned record. Do not leak whether another user's resume exists.

**Linked APIs:** API 3 provides the resume ID. The Agent and Applications flows may access resume content only through authenticated backend services and for the user's requested purpose.

## Data handling notes

- Profile fields include personal contact information, work authorization, salary expectations, and employment history. Apply least-privilege access and avoid writing full values to logs.
- Never expose raw resume contents or long-lived file links in task history.
- Do not treat local drafts as synced profile data.
