# Settings APIs

## Status and scope

**These are proposed API contracts, not live or verified backend endpoints.** The workspace contains no backend source or OpenAPI contract. The current Settings page uses browser storage and does not send API requests or connect provider accounts.

The five operations below cover the current Settings screen: load and save appearance preferences, inspect integrations, save a future connection request, and log out. They assume the authenticated session cookie is managed by the backend. Do not send provider passwords, access tokens, or cookies in JSON.

Base path: `/api/v1`  
JSON errors: `application/problem+json`

## How the Settings APIs work together

1. On page load, call **API 1** to load the saved theme and **API 3** to display real account connection states.
2. When the theme changes, call **API 2** and update the UI from its response. If the save fails, show an error rather than claiming the preference was saved.
3. When the user saves provider choices, call **API 4**. This stores an opt-in request only; it must not start an external authorization flow.
4. Call **API 5** when the user explicitly logs out. Clear local authentication state after the server confirms the session ended.

API 1 is paired with API 2; API 3 is paired with API 4. API 5 invalidates the session that authorizes APIs 1–4. A real provider connection requires a separate, consent-based authorization flow, which is not described as an implemented endpoint here.

## API 1 — Get appearance settings

**Purpose and use:** Read the signed-in user's saved appearance preference when the Settings page opens. This lets a preference follow the user between devices rather than relying only on this browser's `localStorage`.

**Request**

```http
GET /api/v1/settings
Accept: application/json
Cookie: <session cookie managed by the browser>
```

No request body.

**Success — `200 OK`**

```json
{
  "theme": "dark",
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

`theme` is `light`, `dark`, or `system`. The UI should apply the returned value only after it supports that value consistently. In the current page, the System button selects light mode; it does not preserve a distinct system preference.

**Errors:** `401 Unauthorized` for an expired or missing session; `500 Internal Server Error` for an unexpected server failure. Display a useful error and retain the current local appearance rather than silently presenting a default as server data.

**Linked APIs:** API 2 updates this resource. API 5 ends the session used to authorize this request.

## API 2 — Update appearance settings

**Purpose and use:** Persist a theme choice after the user selects Light, Dark, or (once supported by the UI) System.

**Request**

```http
PUT /api/v1/settings
Content-Type: application/json
Accept: application/json
```

```json
{
  "theme": "dark"
}
```

**Success — `200 OK`**

```json
{
  "theme": "dark",
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

The response is the canonical saved value and timestamp. The frontend can use it to confirm the save and synchronize any other visible theme control.

**Errors:** `400 Bad Request` for an unsupported value; `401 Unauthorized` for an invalid session. Keep the unsaved value visible and show a failure status when the update fails.

**Linked APIs:** API 1 reads this value. API 5 ends the session used to authorize this request.

## API 3 — Get account integrations

**Purpose and use:** Populate the account-connections area with supported providers and verified connection status. The screen must distinguish a saved request from a connected account.

**Request**

```http
GET /api/v1/integrations
Accept: application/json
```

No request body.

**Success — `200 OK`**

```json
{
  "integrations": [
    { "provider": "LinkedIn", "status": "not_connected" },
    { "provider": "Gmail", "status": "connected" }
  ]
}
```

`status` is `not_connected`, `pending`, or `connected`. Only a completed provider authorization callback verified by the backend may result in `connected`; selecting a checkbox or saving a request is not sufficient.

**Errors:** `401 Unauthorized` for an invalid session; `500 Internal Server Error` for an unexpected failure. If loading fails, do not imply that accounts are disconnected—show the status as unavailable.

**Linked APIs:** API 4 stores the user's connection request but does not change these statuses. A future OAuth/authorization endpoint is required to actually connect an account. API 5 ends the authorizing session.

## API 4 — Save a connection request

**Purpose and use:** Store which providers the user has asked to connect in the future. This is a preference/opt-in record, not account authorization.

**Request**

```http
PUT /api/v1/integrations/connection-request
Content-Type: application/json
Accept: application/json
```

```json
{
  "providers": ["LinkedIn", "Gmail", "Other"],
  "otherProvider": "Example job board"
}
```

Allowed provider names: `Naukri`, `Gmail`, `LinkedIn`, `Indeed`, and `Other`. `otherProvider` is required when `Other` is selected; otherwise it must be an empty string.

**Success — `200 OK`**

```json
{
  "providers": ["LinkedIn", "Gmail", "Other"],
  "otherProvider": "Example job board",
  "saved": true,
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

**Errors:** `400 Bad Request` for unsupported providers or an invalid `otherProvider`; `401 Unauthorized` for an invalid session. The frontend should announce whether the request was saved and must not change any provider's connected status.

**Linked APIs:** API 3 independently reports actual status. A future provider-specific authorization API would consume user consent and perform secure linking. API 5 ends the session used to save this request.

## API 5 — Log out

**Purpose and use:** End the server-side authenticated session, including when the user signs out from Settings. Client-only storage removal does not invalidate a server session.

**Request**

```http
POST /api/v1/auth/logout
Accept: application/json
```

No request body. The browser sends the session cookie according to the application's cookie policy.

**Success — `200 OK`**

The live OpenAPI currently documents `200 OK` and does not define a response body. The proposed behavior is for the server to invalidate the session and expire the authentication cookie. The client should then clear its in-memory auth state and navigate to `/login`.

**Errors:** `401 Unauthorized` can mean the session was already expired; the client should still clear stale local auth state and return to the sign-in page. Other failures should be surfaced rather than displayed as a successful server logout.

**Linked APIs:** APIs 1–4 require the authenticated session and should reject subsequent unauthenticated calls, typically with `401 Unauthorized`.

## Current frontend mapping

| UI behavior | Current implementation | Proposed API |
|---|---|---|
| Read/change theme | `jobpilot-theme` in browser `localStorage` | APIs 1–2 |
| Choose/save providers | `jobpilot-connection-request` in browser `localStorage`; no account is linked | APIs 3–4 |
| Log out | Calls the backend logout route, clears in-memory auth state, and navigates to `/login` | API 5 |

Related guides: [Agent APIs](./AGENT_API.md), [Candidate data APIs](./CANDIDATE_DATA_API.md), [Job search APIs](./JOB_SEARCH_API.md), [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).
