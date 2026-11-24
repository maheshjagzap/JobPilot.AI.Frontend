import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react'

const Login = lazy(() => import('./pages/Login'))
const AgentWorkspace = lazy(() => import('./pages/AgentWorkspace'))
const Profile = lazy(() => import('./pages/Profile'))
const Resumes = lazy(() => import('./pages/Resumes'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Applications = lazy(() => import('./pages/Applications'))
const AIApply = lazy(() => import('./pages/AIApply'))
const Automation = lazy(() => import('./pages/Automation'))
const ActivityPage = lazy(() => import('./pages/Activity'))
const SettingsPage = lazy(() => import('./pages/Settings'))

const isDemoMode =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark"><BriefcaseBusiness size={19} /></div>
      <span>JobPilot <b>AI</b></span>
    </div>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('jobpilot-theme') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('jobpilot-theme', theme)
  }, [theme])

  const title = useMemo(() => {
    if (location.pathname.startsWith('/applications')) return 'Applications'
    if (location.pathname === '/profile') return 'My Profile'
    if (location.pathname === '/resumes') return 'Documents'
    if (location.pathname === '/settings') return 'Preferences'
    if (location.pathname.startsWith('/automation')) return 'Automation details'
    if (location.pathname === '/activity') return 'Task history'
    if (location.pathname.startsWith('/jobs')) return 'Job results'
    if (location.pathname.startsWith('/ai-apply')) return 'Application review'
    return 'AI Agent'
  }, [location.pathname])

  function startNewTask() {
    navigate('/agent', { state: { newTask: Date.now() } })
    setDrawerOpen(false)
  }

  const sidebar = (
    <>
      <div className="sidebar-brand"><Logo /></div>
      <div className="agent-sidebar-content">
        <button className="new-task-button" onClick={startNewTask} type="button">
          <Plus size={17} /> New task
        </button>
        <section className="task-history-section" aria-label="Recent tasks">
          <div className="sidebar-section-heading">Recent tasks</div>
          <div className="task-history-empty">
            <WandSparkles size={17} />
            <span>Past tasks will appear here when an agent service is connected.</span>
          </div>
        </section>
        <nav className="sidebar-nav secondary-nav" aria-label="My workspace">
          <div className="sidebar-section-heading">My work</div>
          <button className={`nav-item ${location.pathname.startsWith('/applications') ? 'active' : ''}`} onClick={() => { navigate('/applications'); setDrawerOpen(false) }} type="button">
            <BriefcaseBusiness size={18} /><span>Applications</span>
          </button>
          <button className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => { navigate('/profile'); setDrawerOpen(false) }} type="button">
            <UserRound size={18} /><span>My Profile</span>
          </button>
          <button className={`nav-item ${location.pathname === '/resumes' ? 'active' : ''}`} onClick={() => { navigate('/resumes'); setDrawerOpen(false) }} type="button">
            <FileText size={18} /><span>Documents</span>
          </button>
          <div className="sidebar-section-heading settings-heading">Settings</div>
          <button className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => { navigate('/settings'); setDrawerOpen(false) }} type="button">
            <Settings size={18} /><span>Preferences</span>
          </button>
        </nav>
      </div>
      <div className="sidebar-status">
        <span className="status-dot" />
        <span>{isDemoMode ? 'Local preview' : 'Agent service unavailable'}</span>
        <ChevronRight size={15} />
      </div>
    </>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      {drawerOpen && (
        <div className="mobile-backdrop" onMouseDown={() => setDrawerOpen(false)}>
          <aside className="sidebar drawer" onMouseDown={(event) => event.stopPropagation()}>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="main-column">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="workspace-heading"><span>Workspace</span><b>/</b>{title}</div>
          <div className="topbar-actions">
            <span className="agent-status"><span className="status-dot" />{isDemoMode ? 'Preview mode' : 'Agent unavailable'}</span>
            <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isDemoMode) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <AppShell key={location.key}>{children}</AppShell>
}

function PageLoader() {
  return <div className="page-loader"><span /><span /><span /></div>
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/agent" element={<RouteGuard><AgentWorkspace /></RouteGuard>} />
        <Route path="/workspace" element={<Navigate to="/agent" replace />} />
        <Route path="/dashboard" element={<Navigate to="/agent" replace />} />
        <Route path="/profile" element={<RouteGuard><Profile /></RouteGuard>} />
        <Route path="/resumes" element={<RouteGuard><Resumes /></RouteGuard>} />
        <Route path="/jobs" element={<RouteGuard><Jobs /></RouteGuard>} />
        <Route path="/jobs/saved" element={<RouteGuard><Jobs saved /></RouteGuard>} />
        <Route path="/jobs/:jobId" element={<RouteGuard><Jobs detail /></RouteGuard>} />
        <Route path="/jobs/:jobId/match" element={<RouteGuard><Jobs match /></RouteGuard>} />
        <Route path="/applications" element={<RouteGuard><Applications /></RouteGuard>} />
        <Route path="/applications/:applicationId" element={<RouteGuard><Applications detail /></RouteGuard>} />
        <Route path="/ai-apply" element={<RouteGuard><AIApply /></RouteGuard>} />
        <Route path="/ai-apply/:runId/review" element={<RouteGuard><AIApply review /></RouteGuard>} />
        <Route path="/automation" element={<RouteGuard><Automation /></RouteGuard>} />
        <Route path="/automation/:runId" element={<RouteGuard><Automation detail /></RouteGuard>} />
        <Route path="/activity" element={<RouteGuard><ActivityPage /></RouteGuard>} />
        <Route path="/settings" element={<RouteGuard><SettingsPage /></RouteGuard>} />
        <Route path="/" element={<Navigate to="/agent" replace />} />
        <Route path="*" element={<RouteGuard><div className="page-error"><h1>404</h1><h2>Page not found</h2><p>The page you requested does not exist in this workspace.</p><button className="primary-button" onClick={() => window.location.assign('/agent')}>Back to workspace</button></div></RouteGuard>} />
      </Routes>
    </Suspense>
  )
}
