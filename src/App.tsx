import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BriefcaseBusiness,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  WandSparkles,
  X,
} from 'lucide-react'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Resumes = lazy(() => import('./pages/Resumes'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Applications = lazy(() => import('./pages/Applications'))
const AIApply = lazy(() => import('./pages/AIApply'))
const Automation = lazy(() => import('./pages/Automation'))
const ActivityPage = lazy(() => import('./pages/Activity'))
const SettingsPage = lazy(() => import('./pages/Settings'))

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Job Search',
    items: [
      { label: 'Discover Jobs', path: '/jobs', icon: Search },
      { label: 'Saved Jobs', path: '/jobs/saved', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'My Career',
    items: [
      { label: 'My Profile', path: '/profile', icon: CircleUserRound },
      { label: 'Resumes', path: '/resumes', icon: BriefcaseBusiness },
      { label: 'Applications', path: '/applications', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'AI Workspace',
    items: [
      { label: 'AI Apply Agent', path: '/ai-apply', icon: WandSparkles },
      { label: 'Automation Activity', path: '/automation', icon: Activity },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Activity Centre', path: '/activity', icon: Activity },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]

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
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('jobpilot-theme') as 'light' | 'dark') || 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('jobpilot-theme', theme)
  }, [theme])

  const title = useMemo(() => {
    for (const group of navGroups) {
      const item = group.items.find((nav) => location.pathname === nav.path)
      if (item) return item.label
    }
    if (location.pathname.startsWith('/jobs/')) return 'Job Details'
    if (location.pathname.startsWith('/applications/')) return 'Application Details'
    if (location.pathname.startsWith('/automation/')) return 'Automation Run'
    if (location.pathname.startsWith('/ai-apply/')) return 'Application Review'
    return 'Dashboard'
  }, [location.pathname])

  const sidebar = (
    <>
      <div className="sidebar-brand"><Logo /></div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`))
              return (
                <button
                  className={`nav-item ${active ? 'active' : ''}`}
                  key={item.path}
                  onClick={() => { navigate(item.path); setDrawerOpen(false) }}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">MJ</div>
        <div><strong>Mahesh Jagzap</strong><span>Local workspace</span></div>
        <ChevronDown size={16} />
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
          <div className="page-title"><span>JobPilot AI</span><b>/</b>{title}</div>
          <div className="topbar-actions">
            <div className="global-search"><Search size={16} /><input aria-label="Global search" placeholder="Search workspace" /></div>
            <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="icon-button notification-button" aria-label="Notifications"><Activity size={18} /><i /></button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [initialized] = useState(true)
  const [authenticated] = useState(() =>
    import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ||
    sessionStorage.getItem('jobpilot-auth') === 'true',
  )

  if (!initialized) return <div className="loading-page">Loading workspace...</div>
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <AppShell>{children}</AppShell>
}

function PageLoader() {
  return <div className="page-loader"><span /><span /><span /></div>
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<RouteGuard><div className="page-error"><h1>404</h1><h2>Page not found</h2><p>The page you requested does not exist in this workspace.</p><button className="primary-button" onClick={() => window.location.assign('/dashboard')}>Back to Dashboard</button></div></RouteGuard>} />
      </Routes>
    </Suspense>
  )
}
