# Agent APIs

## Status and scope

**These are proposed API contracts, not live or verified backend endpoints.** The frontend's Agent Workspace currently accepts text locally and displays an unavailable message on submit; it does not send the command to an agent service. The UI does not establish that the backend contains multiple specialized agents. This guide describes the user-facing agent capability only.

Base path: `/api/v1`  
JSON errors: `application/problem+json`  
Authentication: secure authenticated session; never put credentials or provider tokens in task messages.

## Intended user flow

1. Read agent availability with **API 1**.
2. Send the user's natural-language instruction with **API 2**.
3. Poll **API 3** for progress and verified results. Continue the conversation with **API 4** when the user sends a follow-up.
4. Show prior tasks using **API 5**.

The agent can request profile, resume, jobs, or application data only through authorized backend capabilities. A task response must not fabricate records or imply that an external action succeeded. Preparing an application is not submitting it; each final submission needs a separate, explicit user review and approval. See [Candidate data APIs](./CANDIDATE_DATA_API.md), [Job search APIs](./JOB_SEARCH_API.md), and [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 1 — Check agent capabilities

**Purpose and use:** Let the workspace show whether the agent service is available and which high-level task categories it accepts. This is a capability check, not a promise that every external source is connected.

**Request**

```http
GET /api/v1/agent/capabilities
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "available": true,
  "taskTypes": ["job_search", "application_status", "profile_question"],
  "updatedAt": "2026-11-24T08:30:00Z"
}
```

An unavailable service may return `503 Service Unavailable` with a problem response. The UI should show the service as unavailable and avoid sending a task if the service cannot accept work.

**Linked APIs:** API 2 creates a task. The categories should correspond only to capabilities backed by the real job, profile, or application services.

## API 2 — Create an agent task

**Purpose and use:** Submit a user's instruction for interpretation and execution. This is the agent workspace's primary action.

**Request**

```http
POST /api/v1/agent/tasks
Content-Type: application/json
Accept: application/json
Idempotency-Key: 2f9f1c84-0e61-48ba-b788-0e908a4c6a9c
```

```json
{
  "instruction": "Find remote backend roles that match my profile",
  "conversationId": null
}
```

`instruction` is required and must be limited in length by the backend. `conversationId` is omitted or `null` for a new conversation and supplied for a follow-up task.

**Accepted — `202 Accepted`**

```json
{
  "taskId": "task_123",
  "conversationId": "conversation_456",
  "status": "queued",
  "statusUrl": "/api/v1/agent/tasks/task_123"
}
```

`202` means queued, not completed. The frontend should store the returned identifiers and fetch progress. An idempotency key protects against accidental duplicate tasks after network retries.

**Errors:** `400 Bad Request` for an empty/invalid instruction; `401 Unauthorized`; `429 Too Many Requests` for rate limits; `503 Service Unavailable` when the service cannot accept work. No error response should be presented as a completed task.

**Linked APIs:** API 3 returns progress/results; API 4 adds a follow-up to the conversation. Work may read candidate information from [Candidate data APIs](./CANDIDATE_DATA_API.md), search through [Job search APIs](./JOB_SEARCH_API.md), or prepare an application through [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 3 — Get task status and result

**Purpose and use:** Poll the task after creation to render status, current step, questions, and completed results. The UI should poll with a reasonable interval and stop when the task is terminal.

**Request**

```http
GET /api/v1/agent/tasks/task_123
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "taskId": "task_123",
  "conversationId": "conversation_456",
  "status": "waiting_for_user",
  "currentStep": "Reviewing search filters",
  "message": "Should I include hybrid roles as well?",
  "results": [],
  "updatedAt": "2026-11-24T08:31:00Z"
}
```

Possible status values in this proposal: `queued`, `running`, `waiting_for_user`, `completed`, `failed`, `cancelled`. A task waiting for user input must not be shown as completed. Results should include source references where available.

**Errors:** `404 Not Found` for an unknown or inaccessible task; `401 Unauthorized` for an invalid session. Do not expose another user's task by accepting an unscoped ID.

**Linked APIs:** API 2 creates the task; API 4 continues a conversation when the task asks a question. Any application preparation or run IDs returned here link to the [Applications and automation APIs](./APPLICATIONS_AUTOMATION_API.md).

## API 4 — Continue an agent conversation

**Purpose and use:** Send a user answer or follow-up instruction in the context of an existing task conversation. Use this when the agent requests clarification or the user asks a related question.

**Request**

```http
POST /api/v1/agent/conversations/conversation_456/messages
Content-Type: application/json
Accept: application/json
```

```json
{
  "message": "Include hybrid roles too"
}
```

**Accepted — `202 Accepted`**

```json
{
  "taskId": "task_124",
  "conversationId": "conversation_456",
  "status": "queued",
  "statusUrl": "/api/v1/agent/tasks/task_124"
}
```

Each user message creates or resumes an auditable task associated with the same conversation. It does not grant consent for an application submission or any other consequential action.

**Errors:** `400 Bad Request` for an empty message; `401 Unauthorized`; `404 Not Found` for an inaccessible conversation.

**Linked APIs:** API 3 tracks the returned task. API 5 lists the conversation's prior tasks.

## API 5 — List recent agent tasks

**Purpose and use:** Populate the Recent tasks area and let the user reopen a prior task.

**Request**

```http
GET /api/v1/agent/tasks?limit=20&cursor=
Accept: application/json
```

**Success — `200 OK`**

```json
{
  "items": [
    {
      "taskId": "task_123",
      "conversationId": "conversation_456",
      "title": "Find remote backend roles",
      "status": "completed",
      "createdAt": "2026-11-24T08:30:00Z"
    }
  ],
  "nextCursor": null
}
```

Use cursor pagination for long histories. Return only the signed-in user's tasks and avoid including sensitive profile answers in list summaries.

**Errors:** `400 Bad Request` for invalid pagination; `401 Unauthorized`.

**Linked APIs:** Open a listed task with API 3. Continue its conversation with API 4.

## Safety and integration requirements

- Treat all task progress and external actions as unconfirmed until a backend result verifies them.
- Ask for clarification when intent or a consequential action is ambiguous.
- Never infer user approval from a task message such as “find jobs” or “prepare applications.”
- Require explicit review and approval for each final application submission; never let the agent approve its own proposal.
- Do not bypass CAPTCHA, MFA, access controls, or provider terms. Keep secrets and authentication data out of prompts and logs.
