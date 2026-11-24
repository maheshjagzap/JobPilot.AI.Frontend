# JobPilot AI --- Product Direction Change & React Frontend Refactor Prompt

**Purpose:** This document replaces the previous traditional job-portal
dashboard direction. Give it to the coding agent together with the
uploaded React ZIP/project and the existing ASP.NET Core backend
repository.

**Core product decision:** JobPilot AI is an AI-agent-first job search
and application assistant. The primary user experience is a
natural-language command/chat workspace. The user tells the agent what
they want in plain English; the agent interprets the request, uses the
candidate profile and resume already stored in the database, searches
suitable job sources, evaluates opportunities, prepares applications,
fills career-site forms where supported, and asks for explicit approval
before final submission.

Do not build a conventional job portal and merely add a chatbot to it.
The agent workspace is the product.

------------------------------------------------------------------------

# 1. MASTER INSTRUCTION TO THE CODING AGENT

Act as a senior product architect, UX designer, React/TypeScript
engineer, AI-agent workflow designer, and integration engineer.

You must **refactor the existing React frontend in the supplied
project** to match the product direction in this document. Do not
discard the existing codebase and start a disconnected demo. Inspect and
reuse suitable components, routing, styling, and project configuration.
Replace or reorganize the current navigation and pages where necessary.

The existing ASP.NET Core backend is a separate repository/project and
is the source of truth for candidate data, authentication, job
discovery, AI orchestration, application records, and automation
capabilities. Inspect it before deciding which API integrations can be
implemented.

Do not invent API routes, database fields, AI capabilities, job records,
job-source integrations, or successful application submissions.

## 1.1 First inspect the supplied frontend ZIP

The supplied ZIP currently contains a Vite + React + TypeScript frontend
with, among other files:

-   `src/App.tsx`
-   `src/pages/Dashboard.tsx`
-   `src/pages/AIApply.tsx`
-   `src/pages/Jobs.tsx`
-   `src/pages/Applications.tsx`
-   `src/pages/Profile.tsx`
-   `src/pages/Resumes.tsx`
-   `src/pages/Automation.tsx`
-   `src/pages/Activity.tsx`
-   `src/pages/Settings.tsx`
-   `src/pages/Login.tsx`
-   `src/App.css`
-   `src/index.css`
-   `package.json`

The current app is a conventional dashboard with separate navigation
entries for Discover Jobs, Saved Jobs, Profile, Resumes, Applications,
AI Apply Agent, Automation Activity, Activity Centre, and Settings. This
is not the desired product experience.

The current `AIApply.tsx` is a placeholder. Its review fields are
hardcoded, and its submit button does not perform a real operation. The
Jobs and Applications pages also show unavailable states. Preserve
truthful unavailable states until real APIs are connected.

The current Login page contains a "Preview workspace" path that sets a
session-storage authentication flag. Do not treat that as real
authentication. Remove or strictly isolate any preview bypass behind an
explicit development-only flag; never allow it in production.

Inspect the actual project before changing it. Do not assume this
summary supersedes the source files.

## 1.2 Inspect the backend before implementing integrations

Inspect the existing ASP.NET Core backend and produce an API capability
inventory for:

-   Authentication/session.
-   Candidate profile.
-   Stored resumes and parsed resume data.
-   Job search/discovery and job sources.
-   Job details and deduplication.
-   Candidate/job matching.
-   AI agent orchestration or chat.
-   Application preparation.
-   Career-site browser automation.
-   Application submission approval.
-   Application tracking/status.
-   Activity/audit history.
-   Follow-up reminders.

For each capability, report actual routes, HTTP methods,
request/response DTOs, enums, authentication requirements, and
implementation status.

Classify each as: 1. Available and implemented. 2. Partially
implemented. 3. Not implemented. 4. Unknown pending further inspection.

Do not create fake API success responses. If a backend capability is
missing, implement the frontend interaction only as a clearly labelled
unavailable/coming-soon state and list the backend contract needed.

Start with an audit and proposed implementation plan. Do not make broad
destructive changes before reporting the audit.

------------------------------------------------------------------------

# 2. PRODUCT VISION

JobPilot AI is a personal AI agent that helps a candidate find and apply
for relevant jobs with minimal manual navigation.

The candidate's profile, work history, education, skills, preferences,
and resume documents are already stored in the backend database. The
user should not need to re-enter those details every time they search or
apply.

The primary workflow is:

1.  User gives the agent an instruction in natural language.
2.  Agent understands the user's intent.
3.  Agent reads the candidate profile and existing resume data from the
    backend.
4.  Agent identifies missing information only when necessary.
5.  Agent searches supported job sources.
6.  Agent filters and ranks jobs using the candidate's real profile and
    the user's request.
7.  Agent presents real job opportunities with source links and reasons
    for the match.
8.  If asked to apply, the agent prepares the application using the
    existing profile and selected stored resume.
9.  Agent opens and fills supported company career pages using browser
    automation where available.
10. Agent pauses for user review and explicit approval before final
    submission.
11. Agent verifies the submission result and stores the confirmed
    application record.
12. User can later ask the agent for progress, follow-ups, or
    application history.

The main experience must be conversational and task-oriented. Do not
force the user to navigate through traditional CRUD pages to complete
this workflow.

## 2.1 Core product principle

**The user gives an outcome. The agent plans and executes the steps.**

Examples: - "Find the latest .NET developer jobs posted today." - "Find
Software Engineer jobs in Mexico City that match my profile." - "Apply
for the latest suitable C# developer jobs using my profile." - "Find
five remote backend developer jobs in Germany." - "Only show jobs that
accept applicants requiring visa sponsorship." - "Apply to the top three
jobs that match my experience." - "Show me the applications I submitted
this week." - "Which companies have not responded to my applications?" -
"Remind me to follow up with the recruiter after five days."

These are examples of natural-language commands, not hardcoded buttons
or fixed workflows. The agent must interpret a wide range of equivalent
instructions.

------------------------------------------------------------------------

# 3. PRIMARY USER EXPERIENCE --- AI AGENT WORKSPACE

The main authenticated route should open the **Agent Workspace**, not a
traditional metrics dashboard.

Suggested route: `/agent` or `/workspace`.

## 3.1 Desktop layout

Create a clean, premium, modern AI workspace.

Suggested layout:

``` text
┌───────────────────────────────────────────────────────────────────────────┐
│ JobPilot AI       Agent Workspace             Activity   Profile   Menu  │
├──────────────────┬────────────────────────────────────────────────────────┤
│                  │                                                        │
│ + New task       │  Good morning. What would you like me to do?           │
│                  │                                                        │
│ RECENT TASKS     │  ┌──────────────────────────────────────────────────┐  │
│                  │  │ Find the latest .NET developer jobs posted today │  │
│ Job search       │  │ using my profile and apply to suitable jobs.     │  │
│ Apply jobs       │  └──────────────────────────────────────────────────┘  │
│ Application      │                                                        │
│ follow-up        │                  [ Run task ]                           │
│                  │                                                        │
│ MY WORK          │  Suggested prompts                                    │
│ Applications    │  [Find latest jobs] [Apply to matching jobs]           │
│ Profile          │  [Check application status]                            │
│                  │                                                        │
│ SETTINGS         │  Agent response and live task results appear here.    │
│ Preferences      │                                                        │
│                  │                                                        │
└──────────────────┴────────────────────────────────────────────────────────┘
```

This is a conceptual wireframe. Produce the actual polished UI with
responsive behaviour.

## 3.2 Main screen components

### A. Workspace header

-   JobPilot AI brand.
-   Current workspace label: "AI Agent".
-   Agent/system availability indicator based on real backend health.
-   Activity/history access.
-   Profile avatar/menu.
-   Theme toggle if supported.

### B. Conversation/task history sidebar

-   "New task" action.
-   Recent agent conversations/tasks.
-   Task title generated from the user's command, for example "Find .NET
    jobs in Mexico".
-   Last activity time.
-   Current status: Running, Waiting for approval, Completed, Failed.
-   Selecting a previous task opens its conversation and result history.
-   Search task history if backend supports it.
-   Do not fabricate prior tasks.

This sidebar is not a conventional feature navigation menu. It
represents previous agent tasks/conversations.

### C. Main conversation area

-   Welcome state when no task is active.
-   User messages.
-   Agent responses.
-   Progress updates.
-   Job result cards embedded in the conversation.
-   Application preparation summaries.
-   Approval cards.
-   Error and manual-intervention cards.
-   Timestamps.
-   Retry/resume controls only where supported.

### D. Natural-language command composer

The most important component.

Fields and controls: - Multi-line text input. - Placeholder: "Tell
JobPilot what you want to do..." - Send/run button. - Stop/cancel button
while a cancellable task is running. - Attachment control only if the
backend supports relevant attachments. - Optional voice input only if
explicitly implemented. - Enter sends; Shift+Enter inserts a new line. -
Suggested prompt chips when the conversation is empty.

The composer should accept free-form instructions. Do not make the user
fill a large search form for ordinary job discovery.

### E. Context indicator

Show which saved candidate context the agent will use: - Candidate
profile loaded. - Resume available/selected. - Target role preferences
loaded. - Location preferences loaded. - Work authorization/visa
sponsorship information available or missing.

Show only information actually returned by the backend. Provide a way to
open profile settings if information is incomplete.

### F. Agent task status

When the agent executes a task, show a readable progress sequence, for
example: - Understanding request. - Loading candidate profile. -
Searching job sources. - Removing duplicate jobs. - Evaluating job
fit. - Preparing application. - Filling career page. - Waiting for user
approval. - Verifying submission.

These steps must be driven by backend events/statuses when available. Do
not simulate progress as if real work occurred.

------------------------------------------------------------------------

# 4. NATURAL-LANGUAGE AGENT COMMANDS AND INTENT HANDLING

The agent must support flexible instructions, not only exact phrases.

## 4.1 Intent categories

At minimum, design the frontend and backend integration to support these
task intents:

### A. Find jobs

Examples: - "Find software developer jobs." - "Find .NET jobs posted
today." - "Find the latest C# backend jobs in Mexico." - "Search for
remote ASP.NET Core jobs in Europe." - "Find jobs matching my profile."

Expected behaviour: - Parse job title/role and skills. - Parse
location/country. - Parse date window such as today, latest, last 7
days. - Parse work model and employment type. - Use saved profile
preferences when the user does not specify a filter. - Ask one concise
clarification only when a required detail is genuinely ambiguous. -
Search supported job sources. - Deduplicate results. - Rank by
relevance. - Return actual job data with source and posted date when
known.

### B. Apply to jobs

Examples: - "Apply for the latest .NET developer jobs using my
profile." - "Apply to the top five matching backend developer jobs." -
"Apply to this job." - "Apply to all jobs I approved."

Expected behaviour: - Determine which jobs are in scope. - Search first
if the user asks for latest/new jobs. - Apply the user's stored
candidate profile and resume. - Check eligibility and required
information. - Show job list and application plan before executing a
batch of applications. - Prepare each application. - Fill supported
application forms. - Pause for user review and explicit approval before
final submission. - Record each successful submission only after
confirmation. - Report partial success, failure, or manual intervention
honestly.

### C. Check status

Examples: - "Show my latest applications." - "What happened to the jobs
I applied for yesterday?" - "Which applications are waiting for a
response?" - "Show interviews scheduled this month."

Expected behaviour: - Retrieve actual application records. - Display
status, company, role, date, and next action. - Never infer an
application status from an opened URL or an attempted form submission.

### D. Follow-up

Examples: - "Which applications need follow-up?" - "Remind me to follow
up with this company in five days." - "Draft a follow-up email for this
application."

Expected behaviour: - Use real application history. - Create reminders
only if backend support exists. - Draft emails only if requested. -
Sending email requires separate explicit authorization and supported
integration.

### E. Profile/context questions

Examples: - "What skills are in my profile?" - "Which resume will you
use?" - "Do I have the experience required for this job?" - "Update my
target location to Mexico City."

Expected behaviour: - Read current saved data. - Clearly distinguish
stored facts from AI suggestions. - Require confirmation for important
profile changes. - Never invent or silently alter candidate facts.

## 4.2 Natural language parsing result

The frontend should support a structured task representation returned by
the backend agent. The exact DTO must be based on the real backend.

Conceptual example only:

``` json
{
  "intent": "ApplyToMatchingJobs",
  "role": "Software Developer",
  "skills": [".NET", "C#", "ASP.NET Core"],
  "location": "Mexico City",
  "postedWithin": "Today",
  "useCandidateProfile": true,
  "useStoredResume": true,
  "maxApplications": 5,
  "requiresVisaSponsorship": true
}
```

Do not hardcode this exact contract unless the backend adopts it. The
backend must be the source of truth.

If the agent cannot confidently interpret a command, it should ask a
concise clarification rather than silently choosing a risky
interpretation.

------------------------------------------------------------------------

# 5. JOB SEARCH RESULTS INSIDE THE CONVERSATION

Do not make a separate traditional Discover Jobs page the primary
job-search workflow.

When the user says "Find jobs", return job results directly inside the
conversation.

## 5.1 Job result card fields

Each real result should show: - Job title. - Company name and logo if
available. - Location and country. - Remote/hybrid/on-site. - Posted
date and date certainty. - Employment type. - Experience requirement. -
Salary and currency if available. - Source/platform. - Original job
URL. - Match score if backend calculates it. - Match explanation. - Key
matching skills. - Missing requirements. - Visa/work authorization
status: - Confirmed sponsorship. - Explicitly not offered. - Not
stated/unknown. - Discovery timestamp.

Do not infer visa sponsorship merely because a role is in another
country or says "relocation". Show "Not stated" if the source does not
confirm it.

## 5.2 Job result actions

-   View original job.
-   View match explanation.
-   Save for later.
-   Dismiss.
-   Prepare application.
-   Add to application batch.
-   Ask agent about this job.

Only show actions supported by backend APIs.

## 5.3 Result grouping and sorting

Support: - Best match. - Newest first. - Salary, when comparable. -
Location. - Sponsorship evidence. - Source.

The agent should explain why jobs were included or excluded.

## 5.4 Search transparency

For every search task, show: - Sources actually searched. - Search
time. - Date range applied. - Number of jobs found. - Number of
duplicates removed. - Number of jobs excluded and broad reasons, where
available. - Any source failures or unavailable integrations.

Never claim "all jobs" or "latest jobs everywhere" if only a subset of
sources was searched.

------------------------------------------------------------------------

# 6. APPLY WORKFLOW --- THE MAIN DIFFERENTIATOR

Resume creation is not the main product objective. The candidate already
has profile information and resume data stored in the database.

The agent should reuse that information rather than repeatedly asking
the user to upload or recreate it.

## 6.1 Application preparation

For a selected job: 1. Load the actual job record and original
application URL. 2. Load the candidate's current profile from the
backend. 3. Load available stored resumes and parsed resume data. 4.
Select the appropriate existing resume according to user preference and
job relevance. 5. Check required candidate information. 6. Identify
missing information. 7. Identify eligibility conflicts and work
authorization questions. 8. Prepare application field values using
verified candidate data. 9. Mark AI-generated suggestions separately
from verified profile facts. 10. Open the career page using the backend
automation service if available.

Do not silently rewrite or create a new resume as a default action.
Resume tailoring can be a future optional capability, not the main
workflow.

## 6.2 Career-page automation

The browser automation must run through a backend-controlled automation
service, not directly inside React.

The React app should: - Start a preparation/automation task through a
real API. - Display run progress and current step. - Receive progress
through polling, SignalR, or another mechanism only if the backend
supports it. - Show the career page/company and job being processed. -
Show fields detected and values filled. - Display screenshots or
evidence only when the backend safely provides them. - Pause for user
input if a field is ambiguous. - Pause when CAPTCHA, MFA, bot
protection, or manual interaction is required. - Never bypass anti-bot
controls or website restrictions. - Never expose browser cookies,
passwords, session tokens, or private browser state.

## 6.3 Approval before submission

The default mode is **Prepare and review**.

Before final submission, show an approval card containing: - Company. -
Job title. - Original job link. - Candidate identity used. - Resume
used. - All application answers. - Source of each answer: - Saved
profile. - Stored resume. - User-provided answer. - AI suggestion. -
Missing/uncertain answers. - Sensitive questions. - Legal declarations
and consent text. - Salary expectation. - Work authorization and visa
sponsorship answers. - Relocation willingness. - Notice period.

Require explicit user review and approval for each application
submission. For batch requests, the agent may prepare multiple
applications, but each final submission must have clear user
authorization. A user may explicitly approve a clearly displayed batch,
but must be able to inspect the target companies and answers before
approval.

Never invent answers to legal, identity, eligibility, background-check,
disability/accommodation, demographic, or work-authorization questions.
Never certify legal declarations without the user's explicit review and
consent.

## 6.4 Submission verification

After approval: - Submit only if the automation provider and website
workflow permit it. - Verify a success confirmation or authoritative
submission response. - Save the application as Submitted only after
confirmation. - Capture application reference/confirmation when
available. - If verification is unavailable, label the state "Submission
attempted --- confirmation not verified", not "Submitted". - If the
website blocks automation, ask the user to complete the final step
manually. - Handle partial success in batch operations accurately.

------------------------------------------------------------------------

# 7. SECONDARY PAGES --- KEEP ONLY WHAT SUPPORTS THE AGENT

The app may retain secondary pages, but they must not compete with the
agent as the primary experience.

## 7.1 Agent Workspace --- primary page

Route: `/agent` or `/workspace`

Purpose: - Natural-language task execution. - Conversation history. -
Search results. - Application preparation. - Approval requests. - Agent
progress and errors.

This is the default page after login.

## 7.2 My Applications --- secondary page

Route: `/applications`

Purpose: - Review confirmed application records. - See company, role,
location, applied date, status, source, and next action. - Filter by
status/date/company. - Open application details and event history. - See
follow-up due dates where supported.

This page is a history and tracking view, not the place where users
manually create every application.

## 7.3 My Profile --- secondary settings page

Route: `/profile`

Purpose: - View and edit the source-of-truth candidate profile. -
Personal details. - Work experience. - Education. - Skills. - Job
preferences. - Salary preferences. - Preferred countries/locations. -
Remote/hybrid/on-site preference. - Work authorization by country. -
Visa sponsorship requirement. - Relocation willingness. - Notice period.

All fields must be based on existing backend DTOs. Show profile
completeness and missing information that may prevent applications.

## 7.4 Resume & Documents --- compact secondary page

Route: `/documents` or `/resumes`

Purpose: - View stored resumes and supporting documents. - Identify the
default resume. - Upload or replace a resume if backend supports it. -
View parsed information if available. - Select preferred resume for
applications.

Do not make resume creation, visual editing, or resume-template
management a major feature in this release.

## 7.5 Task History / Activity --- secondary page or sidebar panel

Purpose: - View past agent tasks. - Search previous tasks. - See task
status, result summary, and date. - Reopen task conversation. - Inspect
failures and manual-intervention requirements.

## 7.6 Settings

Purpose: - Theme. - Agent preferences. - Default job search
preferences. - Preferred job locations. - Target roles/skills. - Maximum
jobs to prepare per task. - Default resume selection. - Application
approval mode. - Notification preferences. - Connected services, only if
implemented. - Session/logout controls.

## 7.7 Automation details

Do not make "Automation Activity" a major top-level product area.
Automation is an internal execution capability of the agent. Show
technical run details in an expandable task detail panel or a secondary
diagnostics view.

------------------------------------------------------------------------

# 8. NAVIGATION REFACTOR

Replace the current traditional sidebar navigation.

Suggested compact navigation:

``` text
JobPilot AI

+ New Task

RECENT TASKS
- Find .NET jobs in Mexico
- Apply to backend roles
- Check application updates

MY WORK
- Applications
- My Profile
- Documents

SETTINGS
- Preferences
```

The main Agent Workspace should occupy most of the screen.

Do not keep prominent top-level entries for: - Discover Jobs. - Saved
Jobs. - Resume Builder. - AI Apply Agent as a separate page. -
Automation Activity as a primary page. - Activity Centre as a primary
page.

Those workflows should be accessible through natural-language commands
and contextual result actions. Secondary pages may still exist where
useful.

------------------------------------------------------------------------

# 9. CONVERSATION AND AGENT RESPONSE COMPONENTS

Build reusable components for the agent experience:

``` text
src/features/agent/
├── pages/
│   └── AgentWorkspacePage.tsx
├── components/
│   ├── AgentSidebar.tsx
│   ├── ConversationView.tsx
│   ├── MessageBubble.tsx
│   ├── UserMessage.tsx
│   ├── AgentMessage.tsx
│   ├── CommandComposer.tsx
│   ├── SuggestedPromptChips.tsx
│   ├── AgentStatusIndicator.tsx
│   ├── TaskProgress.tsx
│   ├── TaskHistoryList.tsx
│   ├── JobResultCard.tsx
│   ├── JobResultList.tsx
│   ├── MatchExplanation.tsx
│   ├── ApplicationPlanCard.tsx
│   ├── ApplicationReviewCard.tsx
│   ├── ApprovalPanel.tsx
│   ├── ManualInterventionCard.tsx
│   ├── AgentErrorCard.tsx
│   └── ContextUsedIndicator.tsx
├── api/
├── hooks/
├── types/
└── utils/
```

Each message/result should support appropriate actions: - Retry task if
safe and supported. - Stop/cancel if supported. - Open source job. -
Save job. - Prepare application. - Review application. - Approve or
reject the proposed action. - Continue after manual intervention.

Do not show controls that have no working behaviour.

------------------------------------------------------------------------

# 10. FRONTEND TECHNICAL REQUIREMENTS

Preserve the current React + TypeScript + Vite setup unless inspection
reveals a concrete reason to change it.

Use: - React. - TypeScript strict mode. - Vite. - React Router. -
TanStack Query for server state. - Axios or an existing typed API
client. - React Hook Form + Zod for forms. - Lucide React icons. -
Tailwind or the existing styling system, but do not mix styling systems
unnecessarily. - Sonner or existing toast system. - Vitest + React
Testing Library.

Before adding dependencies, inspect `package.json` and reuse installed
packages where appropriate. Do not reinstall everything blindly.

Use feature-based architecture. Keep API calls out of page components.
Use typed API modules and hooks.

Suggested structure:

``` text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
├── components/
│   ├── ui/
│   ├── layout/
│   └── feedback/
├── features/
│   ├── auth/
│   ├── agent/
│   ├── applications/
│   ├── profile/
│   ├── documents/
│   ├── settings/
│   └── task-history/
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
├── styles/
├── types/
└── main.tsx
```

------------------------------------------------------------------------

# 11. BACKEND INTEGRATION REQUIREMENTS

The frontend cannot create the agent intelligence by itself. The backend
must orchestrate the task.

Inspect the backend for existing capabilities and map them to the
frontend.

Potential conceptual API capabilities (not assumed to exist):

-   Create agent conversation/task.
-   Send user instruction.
-   Get agent response.
-   Get task status/progress.
-   Get task message history.
-   Search jobs.
-   Get job details.
-   Get candidate profile context.
-   Get stored resumes.
-   Prepare application.
-   Start browser automation.
-   Get automation status.
-   Submit after approval.
-   Get application records.
-   Get activity history.

Do not implement endpoints from these names unless they are confirmed or
explicitly approved as backend work.

## 11.1 Agent orchestration

Prefer a backend agent orchestration flow where the backend: 1. Receives
the natural-language instruction. 2. Loads trusted candidate context. 3.
Classifies intent. 4. Produces a structured plan. 5. Requests
confirmation if necessary. 6. Executes approved tools/tasks. 7. Streams
or returns progress. 8. Stores conversation and task history. 9. Returns
structured results to the frontend.

The frontend should render the plan and progress, not implement hidden
job-search business logic itself.

## 11.2 Streaming and progress

Use the backend's existing supported mechanism: - SignalR if a real hub
exists. - Server-Sent Events if implemented. - Polling as a fallback if
that is the actual API contract.

Do not add SignalR just for appearance. Do not simulate real-time
progress with fake timers.

## 11.3 Candidate context

The agent must use the existing database profile/resume data. The
frontend should not send a duplicate or manually reconstructed profile
on every command unless the backend contract explicitly requires it.

Show the user which context was used and whether any important
information was missing.

------------------------------------------------------------------------

# 12. DESIGN DIRECTION

The product should look like a premium AI productivity workspace, not a
traditional job-board website.

Visual direction: - Clean, calm, modern. - Strong focus on conversation
and task results. - Neutral background and clear content surfaces. - One
restrained primary accent. - Excellent typography and spacing. - Compact
navigation. - Job result cards that are informative but not
overwhelming. - Clear task status and progress. - Distinct approval
cards. - Light and dark themes. - Responsive desktop/tablet/mobile
layouts. - Accessible focus states, labels, keyboard support, and colour
contrast.

Avoid: - A large dashboard full of statistics as the first page. -
Separate forms for every job-search request. - Large resume-builder
sections. - A conventional job-board layout as the primary screen. -
Decorative charts without a real user need. - Fake job data. - Fake
agent thinking/progress. - Buttons that do nothing. - A chatbot floating
in the corner while the rest of the app remains a traditional portal.

------------------------------------------------------------------------

# 13. IMPORTANT SAFETY AND TRUST RULES

1.  The agent must only use candidate facts stored in the database or
    explicitly provided by the user.
2.  Never invent work experience, skills, qualifications, salary
    history, work authorization, visa status, or eligibility.
3.  Distinguish verified profile facts from AI suggestions.
4.  Show source URLs and posted-date confidence for job results.
5.  Do not claim sponsorship exists unless the job/employer source
    confirms it.
6.  Ask for clarification when an application answer is unknown or
    ambiguous.
7.  Do not submit an application without explicit user approval.
8.  For batches, show all target jobs and proposed answers before the
    user approves the batch.
9.  Legal declarations, consent, background checks,
    disability/accommodation, demographic, identity, and work
    authorization answers require user review.
10. Do not bypass CAPTCHA, MFA, bot protection, or website restrictions.
11. Never expose browser cookies, credentials, access tokens, or private
    automation state.
12. Record submission as successful only after authoritative
    confirmation.
13. If confirmation cannot be verified, use an honest uncertain status.
14. Do not send emails or contact recruiters unless separately requested
    and explicitly authorized.
15. Protect candidate profile and resume data.

------------------------------------------------------------------------

# 14. IMPLEMENTATION PHASES

Do not attempt a massive rewrite in one pass.

## Phase 0 --- Audit

-   Inspect supplied React project.
-   Inspect existing backend.
-   Map actual API contracts.
-   Identify existing reusable components.
-   Identify fake/demo behaviours and security issues.
-   Propose refactor plan and list backend gaps.
-   Wait for approval before destructive refactoring.

## Phase 1 --- Agent-first shell

-   Replace traditional sidebar with compact task-history navigation.
-   Create Agent Workspace as default authenticated route.
-   Build conversation layout and command composer.
-   Build suggested prompt chips.
-   Build responsive and theme-aware layout.
-   Keep backend-dependent actions disabled until integrated.

## Phase 2 --- Agent API integration

-   Integrate actual conversation/task APIs.
-   Send natural-language instructions.
-   Render real agent messages and task states.
-   Load task history.
-   Implement stop/retry only if supported.
-   Handle errors and session expiry.

## Phase 3 --- Job search results

-   Render real job result cards inside the conversation.
-   Show source, posted date, location, match explanation, and
    sponsorship evidence.
-   Add save/dismiss/prepare actions only if supported.
-   Implement filters as natural-language refinements and optional
    compact controls.

## Phase 4 --- Application preparation

-   Load profile and stored resume context from backend.
-   Prepare application fields.
-   Show source/provenance for each answer.
-   Flag missing/uncertain fields.
-   Add application plan and review UI.
-   Do not yet claim browser automation works unless it exists.

## Phase 5 --- Browser automation and approval

-   Integrate real backend automation.
-   Show run progress and manual intervention.
-   Implement approval panel.
-   Require explicit user approval.
-   Verify and record submission status.

## Phase 6 --- Secondary pages

-   Applications history.
-   Candidate profile.
-   Documents/resumes.
-   Preferences/settings.
-   Task history/diagnostics.

## Phase 7 --- Testing and handover

-   Test natural-language command submission.
-   Test task history.
-   Test rendering of job results.
-   Test application approval gate.
-   Test sensitive field confirmation.
-   Test failed and interrupted automation.
-   Test responsive UI.
-   Run lint, tests, and production build.
-   Document API gaps and remaining work.

------------------------------------------------------------------------

# 15. ACCEPTANCE CRITERIA

The refactor is complete only when:

-   Login opens the Agent Workspace by default.
-   The first screen clearly invites a natural-language instruction.
-   A user can type a free-form job-search request.
-   The frontend sends it to the real backend agent endpoint, or clearly
    reports that the endpoint is not yet available.
-   The agent can use stored candidate profile/resume context through
    backend integration.
-   Job results appear inside the conversation, not only on a separate
    Jobs page.
-   Results show real source links and honest date/sponsorship
    information.
-   The user can ask the agent to prepare applications.
-   The application review displays all proposed answers and their
    source.
-   Final submission requires explicit user approval.
-   The app never marks an unverified submission as successful.
-   Applications and profile remain accessible as secondary pages.
-   Resume creation is not the primary feature.
-   No fake jobs, metrics, task progress, or application successes are
    displayed.
-   No production authentication bypass exists.
-   Responsive layout works on desktop, tablet, and mobile.
-   TypeScript build, lint, and tests pass.
-   README explains local setup and backend requirements.

------------------------------------------------------------------------

# 16. REQUIRED CODING-AGENT FINAL REPORT

At completion, provide: 1. What changed from the old portal-style
frontend. 2. New folder structure. 3. New primary Agent Workspace screen
and components. 4. Secondary pages retained/removed/reworked. 5.
Natural-language command flow implemented. 6. Actual backend endpoints
integrated. 7. Backend capabilities still missing. 8. Application
approval and safety behaviour. 9. Tests, lint, and build results. 10.
Screenshots of the Agent Workspace and job result/application review
states if possible. 11. Remaining risks and next steps.

Never report a feature as implemented unless it works against a real
backend contract or is clearly identified as a frontend-only
placeholder.

------------------------------------------------------------------------

# 17. FIRST TASK FOR THE CODING AGENT

**Do Phase 0 only.**

Inspect the supplied frontend project and the existing backend
repository. Report: - Current frontend structure and what can be
reused. - Current backend API capabilities. - Candidate profile and
resume data availability. - Whether a natural-language agent/chat
endpoint exists. - Whether job discovery sources are implemented. -
Whether application preparation and browser automation exist. - Whether
approval and submission verification exist. - Proposed new Agent
Workspace layout. - Exact pages/components to remove, merge, retain, or
redesign. - Required backend work before a real end-to-end flow is
possible.

Do not start a destructive rewrite until the audit and plan are
presented.

**Product owner direction:** JobPilot AI must be an AI-agent-first job
search and application assistant. The user's natural-language
instruction is the main entry point. The agent---not a collection of
manual job portal pages---should coordinate the work.
