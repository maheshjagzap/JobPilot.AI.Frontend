# Frontend API Implementation Tracker

| Area | Endpoint / route | Frontend implementation | Test status | Blocker |
|---|---|---|---|---|
| Setup status | `GET /api/v1/auth/setup-status` | Login calls setup status | Build only | Verify origin/rate limit |
| Initial setup | `POST /api/v1/auth/setup` | Login/setup form sends DTO | Build only | Move token to memory |
| Login | `POST /api/v1/auth/login` | Login form sends email/password | Build only | Add session restoration/401 handling |
| Refresh | `POST /api/v1/auth/refresh` | API helper exists | No tests | Coordinated refresh/in-memory token missing |
| Logout | `POST /api/v1/auth/logout` | Settings calls logout | No tests | Clear in-memory session |
| Current owner | `GET /api/v1/auth/me` | API helper exists | No tests | Startup route restoration missing |
| Dashboard | No live route | Placeholder unavailable state | Existing page tests unknown | Backend route/DTO absent |
| Profile | No live route | Browser localStorage drafts | Existing localStorage tests | Backend route/DTO absent |
| Jobs | No live route | Explicit unavailable state | Existing UI tests unknown | Backend route/DTO absent |
| Resumes | No live route | Disabled upload/unavailable state | Existing UI tests unknown | Backend route/DTO absent |
| Applications | No live route | Explicit unavailable state | Existing UI tests | Backend route/DTO absent |
| AI Apply | No live route | Local review/approval only | Existing UI tests | Backend route/DTO absent |
| Agent | No live route | Task not sent/unavailable state | Existing UI tests | Backend route/DTO absent |
| Automation | No live route | Explicit unavailable state | No tests expected | Backend route/DTO absent |
| Activity | No live route | Explicit unavailable state | No tests expected | Backend route/DTO absent |
| Settings | No live route | Browser localStorage preferences | Existing localStorage tests | Backend route/DTO absent |
| Notifications | No live route | Not present | Not applicable | Backend route/DTO absent |
| Billing/credits/referrals/admin | No live route | Not present | Not applicable | Backend route/DTO absent |

## Authentication work remaining

- [ ] Replace `sessionStorage` access-token persistence with memory-only storage.
- [ ] Create centralized API client and auth-aware request wrapper.
- [ ] Implement startup refresh/me restoration.
- [ ] Implement single-flight refresh for concurrent 401 responses.
- [ ] Retry original request once after refresh.
- [ ] Clear session and redirect after failed refresh.
- [ ] Handle expired/revoked/replayed refresh sessions.
- [ ] Remove demo route bypass before authenticated production use.
- [ ] Add server-origin, cookie, CORS, and CSRF verification.

## Feature work remaining

- [ ] Create profile feature services/hooks and replace local drafts.
- [ ] Create job discovery/saved/match services and UI states.
- [ ] Create resume multipart/upload/status/download services.
- [ ] Create application/preparation/submission services.
- [ ] Create agent/automation polling services and state handling.
- [ ] Create activity, notifications, settings, and integration services once live routes exist.
- [ ] Create dashboard summary integration once live route exists.
