# Frontend API Implementation Tracker

| Area | Endpoint / route | Frontend implementation | Test status | Blocker |
|---|---|---|---|---|
| Setup status | `GET /api/v1/auth/setup-status` | Login calls setup status | Build only | Verify origin/rate limit |
| Initial setup | `POST /api/v1/auth/setup` | Login/setup form sends DTO; access token held in memory | Build only | Confirm production cookie/origin behavior |
| Login | `POST /api/v1/auth/login` | Login form sends email/password; access token held in memory | Build only | Add focused auth tests |
| Refresh | `POST /api/v1/auth/refresh` | Single-flight refresh; retry original request once | No dedicated tests | Confirm refresh-cookie, expiry, and replay contract |
| Logout | `POST /api/v1/auth/logout` | Settings calls logout and clears in-memory session | No dedicated tests | Confirm server-side session invalidation |
| Current owner | `GET /api/v1/auth/me` | Called during startup session restoration | No dedicated tests | Confirm owner/session response contract |
| Dashboard | No live route | Placeholder unavailable state | Existing page tests unknown | Backend route/DTO absent |
| Profile | No live route | Browser localStorage drafts | Existing localStorage tests | Backend route/DTO absent |
| Jobs | No live route | Explicit unavailable state | Existing UI tests unknown | Backend route/DTO absent |
| Resumes | No live route | Disabled upload/unavailable state | Existing UI tests unknown | Backend route/DTO absent |
| Applications | No live route | Explicit unavailable state | Existing UI tests | Backend route/DTO absent |
| AI Apply | No live route | Local review/approval only | Existing UI tests | Backend route/DTO absent |
| Agent | Out of scope | Task not sent/unavailable state | Existing UI tests | Requires a separately approved agent-service project; not part of current C# REST API work |
| Automation | No live route | Explicit unavailable state | No tests expected | Backend route/DTO absent |
| Activity | No live route | Explicit unavailable state | No tests expected | Backend route/DTO absent |
| Settings | No live route | Browser localStorage preferences | Existing localStorage tests | Backend route/DTO absent |
| Notifications | No live route | Not present | Not applicable | Backend route/DTO absent |
| Billing/credits/referrals/admin | No live route | Not present | Not applicable | Backend route/DTO absent |

## Authentication work remaining

- [ ] Add focused tests for startup restoration, refresh retry, and logout.
- [ ] Verify expired/revoked/replayed refresh behavior against the backend contract.
- [ ] Remove demo route bypass before authenticated production use.
- [ ] Add server-origin, cookie, CORS, and CSRF verification.

## Feature work remaining

- [ ] Create profile feature services/hooks and replace local drafts.
- [ ] Create job discovery/saved/match services and UI states.
- [ ] Create resume multipart/upload/status/download services.
- [ ] Create application/preparation/submission services.
- [ ] Create automation polling services and state handling once the REST routes are live. Agent task polling is out of scope for current C# REST API work.
- [ ] Create activity, notifications, settings, and integration services once live routes exist.
- [ ] Create dashboard summary integration once live route exists.
