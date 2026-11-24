# JobPilot AI --- React Frontend Build Specification & Master Coding-Agent Prompt

**Document purpose:** Give this complete specification to an AI coding
agent (Kiro, Amazon Q, Cursor, Claude Code, or another repository-aware
coding assistant) to build the JobPilot AI React frontend from scratch
and integrate it with the existing ASP.NET Core backend.

**Product:** JobPilot AI\
**Frontend stack:** React + TypeScript + Vite\
**Backend:** ASP.NET Core Web API, Clean Architecture modular monolith\
**Database:** SQL Server + Entity Framework Core\
**Primary goal:** A polished personal job-search workspace that
discovers jobs, evaluates fit, prepares tailored applications, assists
with career-site form filling, requires user approval before submission,
and tracks applications.

------------------------------------------------------------------------

# PART A --- MASTER PROMPT FOR THE CODING AGENT

Copy everything in this document and give it to your coding agent. The
agent must work inside the existing JobPilot AI repository and must
inspect the actual code before making assumptions.

## 1. Your role

Act as a senior frontend architect, senior React + TypeScript engineer,
UI/UX designer, accessibility specialist, and integration engineer.

Build a complete, production-quality React frontend for **JobPilot AI**
from scratch. Do not produce only a mockup, static HTML, or a collection
of disconnected screens. Build a real, maintainable application with
routing, reusable components, typed models, API integration, form
validation, authentication handling, loading/error/empty states, and
responsive layouts.

The frontend must integrate with the existing ASP.NET Core backend. The
existing backend is the source of truth for API contracts,
authentication behaviour, validation rules, and available features.

## 2. Mandatory repository inspection before coding

Before creating or changing files:

1.  Inspect the entire repository and identify the solution root,
    backend projects, existing frontend folders, README files,
    configuration files, and tests.
2.  Inspect the ASP.NET Core API project:
    -   Controllers or minimal API route mappings.
    -   Request and response DTOs.
    -   Authentication endpoints and token behaviour.
    -   Validation rules and error response format.
    -   Swagger/OpenAPI configuration, if available.
    -   CORS configuration and expected frontend origin.
3.  Inspect the Application, Domain, and Infrastructure projects to
    understand which features are actually implemented.
4.  Build the backend and run its existing tests if the environment
    allows it. Record the results.
5.  Do not invent API endpoints, DTO fields, enum values, authentication
    behaviour, or business rules.
6.  Create a frontend API contract inventory from the real backend. Mark
    each capability as:
    -   Implemented and usable.
    -   Partially implemented.
    -   Not implemented.
7.  If a screen depends on a backend feature that does not exist yet,
    build the frontend structure and a clearly labelled
    disabled/coming-soon state. Do not fake a successful server
    operation.
8.  Do not modify backend code just to make a frontend mockup appear
    functional. If a backend change is genuinely required, explain the
    gap and propose the smallest change separately.

**Current known project constraints to preserve:**

-   The backend uses Clean Architecture with four projects: API,
    Application, Domain, and Infrastructure.
-   The product is being developed as a modular monolith, not
    microservices.
-   React + TypeScript + Vite is the selected frontend stack.
-   ASP.NET Core Web API is the backend.
-   SQL Server and EF Core are the persistence stack.
-   The backend authentication work has been implemented and hardened,
    but database-backed end-to-end verification has been pending. Verify
    current repository state rather than assuming this remains
    unchanged.
-   The current authentication phase is a single local owner/operator
    account. Do not add public registration, multi-user invitations,
    tenant switching, or role management unless the backend and product
    owner explicitly approve it.
-   Existing authentication uses short-lived JWT access tokens and a
    refresh-token cookie. The refresh cookie is HttpOnly, Secure, and
    SameSite=Strict by default. Inspect the actual configuration before
    implementing the client.
-   The frontend and API must use a compatible same-site localhost setup
    during development so the HttpOnly refresh cookie can work
    correctly.
-   Database migrations were intentionally deferred in the earlier
    backend plan. Do not create or run migrations from the frontend
    task.
-   AI provider integration, job discovery integrations, Gmail
    integration, SignalR, Hangfire jobs, and browser-based career-site
    automation must be treated as implemented only if the current
    backend proves they exist.
-   AI Apply Agent is a planned product capability. Do not pretend that
    browser automation or actual application submission already exists.

## 3. Product vision

JobPilot AI should feel like a professional personal command centre for
a job seeker.

The user should be able to:

1.  Maintain a single accurate candidate profile.
2.  Maintain skills, education, work experience, preferences, location,
    notice period, salary expectations, and work authorization details.
3.  Upload and manage resumes and supporting documents.
4.  Discover jobs from supported sources.
5.  Search, filter, sort, save, dismiss, and review jobs.
6.  See a transparent match score and explanation.
7.  Compare job requirements with the candidate's actual profile.
8.  Generate a tailored resume and cover letter where backend support
    exists.
9.  Manage applications through a clear pipeline.
10. Prepare an application for a company career page.
11. Review and approve every application before final submission.
12. Track application status, dates, notes, and follow-up reminders.
13. View system activity, automation status, errors, and job discovery
    history.

The interface must be honest. Never show a job as applied, a resume as
generated, an email as sent, or an automation as successful unless the
backend confirms that result.

## 4. Frontend project location and folder structure

Unless the repository already has an established frontend location,
create:

`JobPilot.AI.Frontend/`

Use this structure. Adjust naming only when an existing repository
convention is clearly better.

``` text
JobPilot.AI/
├── backend/
│   ├── JobPilot.AI.API/
│   ├── JobPilot.AI.Application/
│   ├── JobPilot.AI.Domain/
│   └── JobPilot.AI.Infrastructure/
│
├── JobPilot.AI.Frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   ├── providers/
│   │   │   │   ├── QueryProvider.tsx
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   └── AuthProvider.tsx
│   │   │   └── config/
│   │   │       ├── env.ts
│   │   │       └── navigation.ts
│   │   │
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   └── illustrations/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── feedback/
│   │   │   ├── data-display/
│   │   │   └── forms/
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── api/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   └── types/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── resumes/
│   │   │   ├── jobs/
│   │   │   ├── job-matching/
│   │   │   ├── applications/
│   │   │   ├── ai-apply/
│   │   │   ├── automation/
│   │   │   ├── activity/
│   │   │   └── settings/
│   │   │
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── storage/
│   │   │   ├── validation/
│   │   │   └── utils/
│   │   │
│   │   ├── types/
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── tokens.css
│   │   │   └── themes.css
│   │   │
│   │   ├── test/
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── README.md
│
└── JobPilot.AI.sln
```

Feature folders must own their pages, components, API functions, hooks,
and types. Shared components must not contain feature-specific business
logic.

## 5. Required dependencies

Use the latest mutually compatible stable versions at implementation
time. Do not install unnecessary libraries. Use npm unless the
repository already standardizes on pnpm or yarn.

### Required runtime dependencies

``` bash
npm install react react-dom react-router-dom
npm install @tanstack/react-query
npm install axios
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
npm install date-fns
npm install clsx tailwind-merge
npm install sonner
npm install recharts
```

### Styling dependencies

Use Tailwind CSS with the current Vite-compatible official setup. Check
the current Tailwind documentation and install the correct packages and
Vite plugin for the selected version. Do not copy an outdated Tailwind
v3 setup if using Tailwind v4.

### Development dependencies

``` bash
npm install -D typescript vite
npm install -D @vitejs/plugin-react
npm install -D eslint @eslint/js typescript-eslint
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
npm install -D prettier
```

Optional packages must be added only when there is a real requirement:

-   `@microsoft/signalr` only if the backend exposes a SignalR hub that
    the frontend needs.
-   `@playwright/test` for frontend end-to-end tests, separate from
    backend career-site browser automation.
-   `@tanstack/react-table` if complex data tables justify it.
-   `react-dropzone` if a reusable drag-and-drop upload workflow is
    needed.
-   `@dnd-kit/*` only if drag-and-drop pipeline ordering is implemented.
-   `@tiptap/react` only if rich text editing is genuinely required.

Do not add Redux by default. Use React Query for server state and React
Context or small local state for authentication and UI state. Avoid
duplicating server data in global state.

After installation, verify `package.json`, lockfile, TypeScript
configuration, Vite configuration, linting, and test scripts.

## 6. Visual design system

Build a polished, premium SaaS dashboard. It should look like a serious
productivity product, not a generic admin template.

### Design direction

-   Product name: JobPilot AI.
-   Visual style: modern, minimal, clean, confident, professional.
-   Default theme: light.
-   Also provide a complete dark theme.
-   Primary accent: restrained indigo/blue or a similarly professional
    accent.
-   Background: soft neutral grey.
-   Cards: white in light theme, elevated neutral surfaces in dark
    theme.
-   Use subtle borders, restrained shadows, consistent radii, and clear
    typography.
-   Use Lucide icons consistently.
-   Avoid excessive gradients, glassmorphism, neon effects, oversized
    empty hero sections, and unnecessary animations.
-   Use consistent spacing and responsive breakpoints.
-   Make tables, forms, and charts readable on laptop and mobile.
-   Support keyboard navigation, visible focus, semantic HTML,
    accessible labels, and sufficient contrast.
-   Use skeletons for loading states and clear empty/error states.

### Main application shell

Desktop: - Fixed/collapsible left sidebar, approximately 250--270px wide
when expanded. - Top bar with page title/breadcrumb, global search if
implemented, notification/activity indicator if supported, theme toggle,
and profile menu. - Main content area with a comfortable maximum width
and consistent padding. - Sidebar groups: - Overview: Dashboard. - Job
Search: Discover Jobs, Saved Jobs. - My Career: Profile, Resumes,
Applications. - AI Workspace: AI Apply Agent, Automation Activity. -
System: Settings.

Mobile: - Sidebar becomes a drawer or compact navigation. - Header
remains compact. - Tables become cards or horizontally scrollable only
when appropriate. - Primary actions remain easy to reach. - No clipped
modals or forms.

## 7. Page-by-page requirements

Create the pages below. If backend functionality is missing, show a
realistic disabled/coming-soon state and explain what backend capability
is needed. Do not fabricate records or claim an operation succeeded.

### 7.1 Authentication --- `/login`

Purpose: protect the local JobPilot workspace.

Layout: - Centered login card on a calm neutral background. - JobPilot
AI logo/wordmark. - Heading: "Welcome back". - Short subtitle: "Sign in
to your job-search workspace." - Username/email field based on the
actual backend contract. - Password field with show/hide toggle. -
Remember-device option only if compatible with the actual token model;
do not persist sensitive tokens in localStorage. - Submit button with
loading state. - Inline validation and server error message. - No public
registration link because the current phase is single-owner local
authentication. - No forgot-password flow unless the backend explicitly
supports it.

Behaviour: - Call the real backend login endpoint. - Handle access token
and refresh cookie according to the inspected backend contract. - Do not
store refresh tokens in JavaScript storage. - If access tokens are
returned in the response, keep them in memory where possible. - On
reload, use the backend refresh/session endpoint if one exists. - On
401, attempt the supported refresh flow once; avoid infinite refresh
loops. - Redirect authenticated users to Dashboard. - Redirect
unauthenticated users from protected routes to Login.

### 7.2 Dashboard --- `/dashboard`

Purpose: give a quick overview of the job-search process.

Header: - "Good morning/afternoon" only if time-aware greeting is
implemented cleanly. - "Your job search at a glance". - Date range
selector only if backend supports date-filtered metrics.

Summary cards: - Jobs discovered. - Jobs saved. - Applications in
progress. - Interviews. - Responses received. - Application tasks
needing attention.

Main sections: 1. Application pipeline overview. 2. Recent matching
jobs. 3. Recent application activity. 4. Profile/resume completeness. 5.
AI Apply Agent status. 6. Upcoming follow-ups, if reminders exist.

Rules: - All metrics must come from backend APIs. - If there is no data,
show helpful empty states with links to the relevant page. - Do not
hardcode attractive fake numbers. - If some metrics are not supported
yet, omit or mark them as unavailable rather than inventing values.

### 7.3 Candidate Profile --- `/profile`

Purpose: maintain the candidate's verified source-of-truth information.

Use tabs or clear sections:

**Personal details** - Full legal name. - Preferred name, if
supported. - Email. - Phone. - Current city and country. - LinkedIn
URL. - GitHub/portfolio URL.

**Professional summary** - Professional headline. - Summary/about
section. - Total experience, with exact dates where possible. - Current
job title. - Current employer. - Notice period.

**Work experience** - Employer. - Job title. - Location. - Start date
and end date. - Current role toggle. - Responsibilities. -
Achievements. - Technologies used.

**Education** - Institution. - Degree. - Field of study. - Start/end
year. - Grade only when the user chooses to provide it.

**Skills** - Skill name. - Category. - Proficiency level, if
supported. - Years of experience only when supplied by the user. - Do
not infer or exaggerate skill proficiency.

**Job preferences** - Target roles. - Preferred countries/cities. -
Remote/hybrid/on-site preference. - Minimum/target salary. - Currency
and pay period. - Employment type. - Preferred technologies.

**International relocation** - Current country of residence. - Countries
willing to relocate to. - Work authorization by country. - Requires visa
sponsorship: yes/no. - Willing to relocate: yes/no. - Passport
availability/expiry only if the user chooses to store it. - Never assume
a candidate has work authorization.

Actions: - Edit profile. - Save changes. - Cancel edits. - Show
unsaved-changes warning. - Validate all fields. - Use actual backend
DTOs and validation.

### 7.4 Resume Management --- `/resumes`

Purpose: upload and manage source resumes and tailored versions.

Page sections: - Page heading and "Upload resume" button. - Resume list
with filename, upload date, file type, size, status, and primary/default
indicator if supported. - Preview/download action only when backend
provides a secure file endpoint. - Set as primary resume only if
supported. - Delete with confirmation. - Empty state explaining
supported file formats and size limits from backend validation.

Resume details: - Resume file. - Parsed candidate information, if
parsing exists. - Skills extracted, if parsing exists. - Experience
extracted, if parsing exists. - Parsing status and error state. -
Tailored versions linked to the relevant job, if generation exists.

Security: - Validate file type and size in the UI, but backend remains
authoritative. - Never expose internal storage paths. - Do not put
private resume files in a public static folder. - Avoid long-lived
public file URLs.

### 7.5 Discover Jobs --- `/jobs`

Purpose: browse and search jobs discovered from supported sources.

Layout: - Search input. - Filters panel/drawer. - Results list. - Sort
selector. - Pagination or infinite scroll based on backend support.

Filters: - Keyword/title. - Country/city. - Technology/skill. -
Experience range. - Remote/hybrid/on-site. - Salary range and
currency. - Employment type. - Date discovered/posted. - Visa
sponsorship only if source data explicitly indicates it.

Each job card: - Job title. - Company. - Location. - Work model. -
Posted/discovered date. - Salary, only if available. - Source name. -
Match score, if calculated. - Save/unsave action. - Dismiss action, if
supported. - "View details" action.

Job details drawer/page: - Full job description. - Required skills. -
Preferred skills. - Experience requirements. - Location/work model. -
Salary details. - Application URL/source. - Visa sponsorship
evidence/status: Confirmed, Not stated, or Not offered. Do not infer
sponsorship from location. - Match score with explanation. - Missing
skills and strengths. - Actions: Save, Dismiss, Prepare application,
Open original listing.

Never create fake job listings to fill the screen. Use a development
seed dataset only if clearly marked as demo data and isolated from
production.

### 7.6 Saved Jobs --- `/jobs/saved`

Purpose: review jobs the candidate wants to pursue.

Features: - Saved job list. - Filters and sort. - Remove from saved. -
Move to application preparation, if supported. - Show already-applied
state only when confirmed by application records. - Empty state linking
to Discover Jobs.

### 7.7 Job Match Analysis --- `/jobs/:jobId/match`

Purpose: explain how well a job matches the candidate.

Sections: - Overall match percentage. - Required skill coverage. -
Preferred skill coverage. - Experience alignment. - Location/work
authorization considerations. - Strong matches. - Missing or weak
matches. - Recommendations to improve the application.

Important: - Match percentage must come from backend logic. - Explain
the score in understandable terms. - Never encourage adding skills or
experience the candidate does not actually have. - Show data freshness
and analysis date if available.

### 7.8 Applications --- `/applications`

Purpose: track the user's job application pipeline.

Suggested stages, only if compatible with backend status enums: -
Draft. - Ready for review. - Approved. - Submitted. - Acknowledged. -
Interview. - Offer. - Rejected. - Withdrawn.

Views: - Table/list view. - Optional Kanban view only if the API
supports status updates. - Search/filter by company, role, date, and
status. - Application detail view. - Timeline of status changes. - Notes
and follow-up date. - Original job link. - Resume/cover letter used. -
Submission confirmation/reference when available.

Actions: - Create draft. - Update notes. - Update status only through
supported API. - Add follow-up reminder only if backend supports it. -
Delete/archive with confirmation if supported.

Do not mark an application as Submitted merely because a browser
automation run opened a career page or filled a form.

### 7.9 AI Apply Agent --- `/ai-apply`

This is a key differentiating feature. Build the user experience in a
modular way so backend automation can be added incrementally.

Main screen: - Heading: "AI Apply Agent". - Description: "Prepare job
applications with AI assistance. You stay in control of every
submission." - Status card: automation availability and browser session
status, based on backend. - Queue of jobs ready for application
preparation. - Recent preparation runs. - Supported career platform
list, based only on implemented adapters. - Clear explanation of
approval-required submission.

Preparation workflow: 1. User selects a saved/discovered job. 2. System
loads candidate profile and selected resume. 3. System checks required
profile information. 4. AI prepares suggested answers and tailored
documents if supported. 5. User sees a field-by-field review. 6. Browser
automation opens the company application page, only if supported. 7.
Agent fills supported fields and uploads approved documents. 8. Agent
pauses before final submission. 9. User reviews all fields and confirms.
10. Backend submits only after explicit approval and supported site
behaviour. 11. Save the confirmed result and application reference.

Application review screen: - Company and job title. - Original career
page URL. - Resume selected. - Cover letter selected. - Form fields and
their proposed values. - Source of each answer: Candidate profile,
Resume, User-entered, or AI suggestion. - Confidence/needs-review
marker. - Missing information warnings. - Sensitive questions
highlighted. - Edit controls. - Checkbox/confirmation that the user
reviewed the information. - Final submit button disabled until required
fields are valid and explicit approval is recorded.

Sensitive fields requiring careful user confirmation: - Work
authorization. - Visa sponsorship. - Salary expectations. - Notice
period. - Relocation willingness. - Criminal/background-check
declarations. - Disability/accommodation questions. -
Demographic/equal-opportunity questions. - Legal attestations and
consent.

Never invent an answer to a legal, identity, eligibility, or sensitive
question. Ask the user or leave it blank. Never automatically accept
legal terms or certify statements on the user's behalf without explicit
review and consent.

### 7.10 Automation Activity --- `/automation`

Purpose: show browser automation jobs and their results.

List: - Run ID. - Company/job. - Career platform. - Started/finished
time. - Status. - Current step. - Error summary. - Screenshot/evidence
link if safely available.

Statuses may include: - Queued. - Running. - Waiting for user. -
Completed. - Failed. - Cancelled. - Manual action required.

Run details: - Step-by-step activity log. - Screenshot preview if
backend provides one. - Error details safe for the user. - Retry action
only when backend supports safe retry. - Cancel action only when backend
supports cancellation. - Resume/manual intervention action when
supported.

Security: - Never show browser cookies, access tokens, passwords,
session storage, or secret values. - Do not attempt to bypass CAPTCHA,
MFA, bot protection, or website restrictions. - If manual interaction is
required, pause and tell the user what to do.

### 7.11 Activity Centre --- `/activity`

Purpose: show important product events.

Examples: - Jobs discovered. - Resume uploaded. - Match analysis
completed. - Application prepared. - User approval received. -
Application submitted. - Automation paused/failed. - Follow-up due.

Use backend events/audit records where available. Do not create fake
activity.

### 7.12 Settings --- `/settings`

Sections: - General preferences. - Theme: light/dark/system. - Default
resume, if supported. - Job discovery preferences. - Notification
preferences, if supported. - AI settings, only if backend exposes safe
user controls. - Connected integrations, if implemented. -
Security/session controls. - Logout.

Do not display secret API keys or credentials. Do not expose server
environment variables.

### 7.13 Not found and error pages

Create: - 404 Not Found. - 403 Access Denied, if relevant. -
500/Unexpected Error. - Offline/network error state. - Session expired
state.

Each should provide a safe way back to Dashboard or Login.

## 8. Routing

Use React Router. Suggested routes:

``` text
/login
/dashboard
/profile
/resumes
/jobs
/jobs/saved
/jobs/:jobId
/jobs/:jobId/match
/applications
/applications/:applicationId
/ai-apply
/ai-apply/:runId/review
/automation
/automation/:runId
/activity
/settings
/*
```

Requirements: - Public route: Login. - Protected routes: all application
pages. - Route guard must wait for authentication initialization before
redirecting. - Preserve intended destination after login where
appropriate. - Use lazy loading for feature pages. - Show a not-found
page for unknown routes. - Do not rely on frontend route protection as
the only security control; backend must enforce authorization.

## 9. API integration architecture

Create a single typed API client.

Suggested files:

``` text
src/lib/api/
├── apiClient.ts
├── apiError.ts
├── apiRoutes.ts
└── types.ts
```

Requirements: - Base URL from environment variable. - Set JSON content
type appropriately. - Use `withCredentials: true` when required by the
backend cookie-based refresh flow. - Configure a single controlled
refresh strategy only after inspecting backend auth endpoints. - Prevent
concurrent refresh storms. - Retry a failed request at most once after a
successful refresh. - Do not loop indefinitely. - Normalize validation
and server errors for display. - Use AbortSignal/cancellation for
requests where appropriate. - Keep endpoint paths in one place. - Keep
feature API modules separate, for example
`features/jobs/api/jobsApi.ts`. - Use React Query for fetching, caching,
invalidation, and mutations. - Do not call Axios directly from page
components. - Never log access tokens, cookies, passwords, resume
contents, or personal sensitive data.

If Swagger/OpenAPI is available: - Use it to verify the API contract. -
Prefer generated types only if the generated workflow is maintainable
and supported. - Otherwise create manually maintained TypeScript types
matching the real DTOs. - Document any backend contract mismatch.

## 10. Authentication and security requirements

-   Follow the actual backend login, refresh, and logout contracts.
-   Refresh tokens must remain in HttpOnly cookies and must never be
    read by JavaScript.
-   Do not store passwords or refresh tokens in
    localStorage/sessionStorage.
-   Keep access tokens in memory if that is the backend contract.
-   Use HTTPS outside local development.
-   Configure same-site development origins correctly for cookie
    behaviour.
-   Do not hardcode secrets or API keys in frontend code.
-   Validate user input on the client for usability and on the server
    for security.
-   Escape/render user-provided content safely.
-   Avoid unsafe HTML rendering.
-   Apply route guards and handle expired sessions.
-   Do not send private profile/resume data to third-party AI services
    directly from the browser. All AI calls should go through the
    backend.
-   Never fabricate user consent or application answers.
-   Keep a visible audit trail for consequential automation actions.

## 11. Forms and validation

Use React Hook Form + Zod for forms.

Requirements: - Reuse common form controls. - Display labels, hints,
required markers, and inline validation. - Map backend validation errors
to the correct fields. - Preserve entered data when safe after a
recoverable server error. - Warn before navigating away from unsaved
changes. - Disable submit buttons while submitting. - Prevent accidental
double submissions. - Confirm destructive actions with a dialog. - Do
not silently discard invalid or incomplete data.

## 12. Reusable UI components

Build reusable components, not one-off page markup.

At minimum:

``` text
components/ui/
├── Button
├── Input
├── PasswordInput
├── Textarea
├── Select
├── Checkbox
├── RadioGroup
├── Switch
├── Dialog
├── Drawer
├── DropdownMenu
├── Tabs
├── Badge
├── Card
├── Tooltip
├── Skeleton
├── Spinner
├── Progress
├── Avatar
├── Separator
└── EmptyState

components/layout/
├── AppShell
├── Sidebar
├── MobileNavigation
├── Topbar
├── PageHeader
└── Breadcrumbs

components/feedback/
├── ErrorState
├── LoadingState
├── NetworkError
├── ConfirmDialog
└── ToastProvider

components/data-display/
├── DataTable
├── StatusBadge
├── MatchScore
├── ActivityTimeline
└── StatCard
```

Use an accessible component library such as shadcn/ui only if it is
installed and configured consistently. Do not mix multiple component
libraries without a reason. If using shadcn/ui, its components are
project-owned source files; customize them to the product design.

## 13. State management rules

-   React Query: server state.
-   React Context: authentication/session and theme only where
    appropriate.
-   Local component state: temporary UI state.
-   URL search parameters: shareable filters, pagination, and sorting
    where appropriate.
-   Avoid Redux unless a demonstrated complexity requires it.
-   Do not duplicate server data in Context.
-   Invalidate relevant queries after successful mutations.
-   Provide optimistic updates only when rollback behaviour is
    implemented.

## 14. Responsive behaviour

Test at these widths: - 360px mobile. - 390px mobile. - 768px tablet. -
1024px laptop. - 1366px desktop. - 1920px wide desktop.

Requirements: - No horizontal overflow. - Sidebar becomes mobile
navigation. - Forms stack vertically on mobile. - Tables adapt to cards
or controlled horizontal scroll. - Dialogs fit within viewport. - Touch
targets are appropriately sized. - Charts resize correctly. - Long job
descriptions and company names wrap safely.

## 15. Accessibility and usability

-   Semantic landmarks and heading hierarchy.
-   Labels for every input.
-   Keyboard-accessible navigation and dialogs.
-   Visible focus indicators.
-   Proper aria attributes where needed.
-   Accessible validation and error announcements.
-   Do not use colour alone to communicate status.
-   Respect reduced-motion preferences.
-   Ensure adequate contrast in both themes.

## 16. Testing requirements

Set up Vitest and React Testing Library.

Write tests for: - Login form validation. - Authentication provider
state. - Protected route behaviour. - API error handling. - Profile form
validation. - Job filtering UI. - Save/unsave job mutation behaviour. -
Application status display. - AI Apply review and approval gating. -
Sensitive question confirmation. - No accidental submission before
explicit approval. - Responsive navigation where practical.

If Playwright E2E tests are added: - Test the frontend against a
controlled test backend or mock server. - Do not automate real
third-party job submissions in tests. - Never use real candidate
credentials in automated tests.

## 17. Environment configuration

Create `.env.example` with safe placeholders only:

``` env
VITE_APP_NAME=JobPilot AI
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_DEMO_MODE=false
```

Use the actual API port discovered from backend launch settings. The
example above is a placeholder, not an assumed port.

Requirements: - Validate required environment variables at startup. -
Never put server secrets in VITE\_ variables. - Add `.env` to
`.gitignore`. - Explain local configuration in README.

## 18. Development scripts

Provide scripts similar to:

``` json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

Adjust scripts to the actual TypeScript/Vite configuration. Ensure
`npm run build`, `npm run lint`, and `npm run test:run` work.

## 19. Implementation phases

Do not attempt to implement every page in one uncontrolled
code-generation pass. Work in verified phases.

### Phase 0 --- Repository and API audit

-   Inspect repository.
-   Identify backend routes and DTOs.
-   Build API contract inventory.
-   Report existing features and gaps.
-   Propose frontend folder location.
-   Do not begin feature implementation until this report is complete.

### Phase 1 --- React foundation

-   Create Vite React TypeScript app.
-   Install dependencies.
-   Configure TypeScript, ESLint, Prettier, Tailwind, Vitest.
-   Create base folder structure.
-   Add global design tokens and themes.
-   Add router and app providers.
-   Verify dev server and production build.

### Phase 2 --- Application shell and authentication

-   Build sidebar, topbar, mobile nav, theme handling.
-   Implement Login using actual backend contracts.
-   Implement protected routes.
-   Implement session initialization, refresh, logout.
-   Test authentication flows.
-   Do not create registration or password recovery.

### Phase 3 --- Profile and resume management

-   Build profile sections and forms.
-   Build resume upload/list/preview workflows.
-   Integrate only APIs that exist.
-   Add clear disabled states for missing endpoints.

### Phase 4 --- Dashboard and job discovery

-   Build dashboard using real metrics.
-   Build job search, filters, list, details, saved jobs.
-   Add match analysis UI when API support exists.

### Phase 5 --- Application tracking

-   Build application list and detail pages.
-   Build status timeline and follow-up UI.
-   Integrate real APIs and enums.

### Phase 6 --- AI Apply Agent preparation and review

-   Build preparation queue and review interface.
-   Show field provenance and confidence.
-   Add explicit approval gate.
-   Do not submit any real application yet unless the backend automation
    capability is implemented and verified.

### Phase 7 --- Browser automation UI

-   Integrate with backend automation endpoints only after they exist.
-   Show run state, progress, manual intervention, errors, screenshots,
    and results.
-   Require user confirmation before final submission.
-   Do not bypass CAPTCHA, MFA, anti-bot controls, or website
    restrictions.

### Phase 8 --- Quality and handover

-   Complete responsive checks.
-   Complete accessibility checks.
-   Run tests, lint, and production build.
-   Fix all errors.
-   Update README with setup and run instructions.
-   Provide a final implementation report.

## 20. Definition of done

The frontend task is not complete until:

-   The React application starts locally.
-   The production build succeeds.
-   TypeScript has no errors.
-   ESLint has no errors.
-   Tests pass.
-   Login works with the real backend contract, or the exact blocking
    backend gap is documented.
-   Protected routes behave correctly.
-   All implemented pages have loading, error, and empty states.
-   Responsive navigation works.
-   Light and dark themes work.
-   Forms validate correctly.
-   No fake successful API responses exist in production code.
-   No credentials or secrets are committed.
-   API contracts are documented.
-   README explains installation, environment variables, and local
    startup.
-   The final report lists implemented pages, backend dependencies, test
    results, and remaining work.

## 21. Required final report from the coding agent

At the end, provide:

1.  Exact frontend folder path.
2.  Complete folder tree.
3.  Dependencies installed and why.
4.  Pages implemented.
5.  Components implemented.
6.  API endpoints integrated, with actual HTTP methods and paths.
7.  Backend endpoints still missing.
8.  Authentication behaviour and any limitations.
9.  Environment variables required.
10. Commands to install, run, lint, test, and build.
11. Test results.
12. Screenshots of major pages if the environment supports screenshots.
13. Known issues and next recommended task.

**Do not say "completed" unless the build and tests have actually been
run.**

------------------------------------------------------------------------

# PART B --- PRODUCT UX MAP

This section is a concise design reference for the screens the coding
agent must create.

  -----------------------------------------------------------------------
  Page                    Primary purpose         Main content
  ----------------------- ----------------------- -----------------------
  Login                   Secure entry            Login form, errors,
                                                  loading

  Dashboard               Overview                Job metrics, pipeline,
                                                  recent activity

  Profile                 Candidate source of     Personal, experience,
                          truth                   skills, preferences

  Resumes                 Document management     Upload, list, preview,
                                                  versions

  Discover Jobs           Find opportunities      Search, filters, cards,
                                                  job details

  Saved Jobs              Shortlist               Saved jobs and actions

  Match Analysis          Evaluate fit            Score, strengths, gaps,
                                                  explanation

  Applications            Track progress          Pipeline, filters,
                                                  status, timeline

  AI Apply Agent          Prepare applications    Queue, preparation,
                                                  review, approval

  Automation Activity     Observe automation      Runs, logs,
                                                  screenshots, manual
                                                  steps

  Activity Centre         Audit events            Chronological activity
                                                  feed

  Settings                Preferences             Theme, defaults,
                                                  integrations, security

  Not Found               Recovery                Helpful navigation
  -----------------------------------------------------------------------

## Suggested navigation labels

-   Dashboard
-   Discover Jobs
-   Saved Jobs
-   My Profile
-   Resumes
-   Applications
-   AI Apply Agent
-   Automation Activity
-   Activity Centre
-   Settings

## Suggested dashboard wireframe

``` text
┌─────────────────────────────────────────────────────────────────────┐
│ JobPilot AI             Search jobs...             Theme   Profile   │
├───────────────────┬─────────────────────────────────────────────────┤
│ Dashboard         │ Dashboard                                       │
│                   │ Your job search at a glance                     │
│ JOB SEARCH        │                                                 │
│ Discover Jobs     │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ Saved Jobs        │ │ Discovered│ │ Saved    │ │ Applied  │          │
│                   │ └──────────┘ └──────────┘ └──────────┘          │
│ MY CAREER         │                                                 │
│ My Profile        │ ┌──────────────────────┐ ┌────────────────────┐ │
│ Resumes           │ │ Application Pipeline │ │ Profile Completion│ │
│ Applications      │ │                      │ │                    │ │
│                   │ └──────────────────────┘ └────────────────────┘ │
│ AI WORKSPACE      │                                                 │
│ AI Apply Agent    │ ┌─────────────────────────────────────────────┐ │
│ Automation        │ │ Recommended Jobs                            │ │
│ Activity          │ │ Job cards                                    │ │
│                   │ └─────────────────────────────────────────────┘ │
│ SYSTEM            │                                                 │
│ Activity Centre   │ ┌─────────────────────────────────────────────┐ │
│ Settings          │ │ Recent Activity                              │ │
└───────────────────┴─────────────────────────────────────────────────┘
```

## Suggested job detail wireframe

``` text
┌─────────────────────────────────────────────────────────────────────┐
│ Company logo  Software Engineer - .NET                              │
│               Company · City · Work model                            │
│               Match score: based on backend analysis                 │
├─────────────────────────────────────────────────────────────────────┤
│ Job Description                         │ Job Overview               │
│                                         │ Location                   │
│ Responsibilities                        │ Experience                 │
│ Required Skills                         │ Employment Type             │
│ Preferred Skills                        │ Salary, if available        │
│                                         │ Sponsorship evidence        │
│                                         │                             │
│ Match Analysis                          │ Actions                     │
│ Strengths                               │ Save Job                    │
│ Skill Gaps                              │ Prepare Application         │
│                                         │ Open Original Listing       │
└─────────────────────────────────────────────────────────────────────┘
```

## Suggested AI Apply review wireframe

``` text
┌─────────────────────────────────────────────────────────────────────┐
│ Review application                                                   │
│ Company · Role · Career platform                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Resume selected: Mahesh_Jagzap_Backend_Resume.pdf                    │
│ Cover letter: Generated draft / Not available                        │
├─────────────────────────────────────────────────────────────────────┤
│ Application field             Proposed answer        Source           │
│ Full name                     Candidate name         Profile          │
│ Email                         Candidate email        Profile          │
│ Current title                 Associate Engineer     Profile          │
│ Work authorization            Needs confirmation     User review      │
│ Visa sponsorship              Requires sponsorship   User review      │
│ Salary expectation            User-approved value    User review      │
│ Notice period                 User-confirmed value   User review      │
├─────────────────────────────────────────────────────────────────────┤
│ Warnings: Review every legal and eligibility question.               │
│                                                                     │
│ [Save Draft] [Return to Edit] [I reviewed this application]          │
│                                                                     │
│                         [Submit Application]                          │
│                  Disabled until explicit approval                    │
└─────────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# PART C --- IMPORTANT PRODUCT RULES

1.  Candidate data must have one source of truth in the Profile feature.
2.  Resume content must not silently overwrite profile details.
3.  AI-generated answers must be editable and traceable to their source.
4.  Never invent work experience, qualifications, skills, salary
    history, work authorization, or visa status.
5.  A match score must be explainable.
6.  Job source URLs must be preserved.
7.  An application is not submitted until a successful submission is
    confirmed.
8.  Every real application submission requires explicit user approval.
9.  Legal declarations, eligibility questions, background-check consent,
    accommodation questions, and demographic questions require the
    user's review.
10. CAPTCHA, MFA, and anti-bot controls must not be bypassed.
11. Automation failures must be visible and recoverable.
12. Private documents and authentication tokens must be protected.
13. Do not add multi-user SaaS registration or tenant management in this
    local single-owner phase.
14. Do not implement backend features by faking frontend success states.
15. Keep the architecture modular so future ATS adapters can be added
    without rewriting the UI.

------------------------------------------------------------------------

# PART D --- FIRST MESSAGE TO THE CODING AGENT

Start by doing **Phase 0 only**.

Do not create the React app yet. First inspect the existing JobPilot AI
repository and backend. Return:

-   Repository structure.
-   Backend API endpoints and DTOs currently available.
-   Authentication contract and cookie/CORS requirements.
-   Existing completed features.
-   Missing backend capabilities required by each frontend page.
-   Recommended frontend directory location.
-   Any conflicts or risks discovered.

Wait for approval before proceeding to Phase 1. After approval,
implement one phase at a time and verify each phase before moving
forward.
