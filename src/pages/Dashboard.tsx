import { Activity, BriefcaseBusiness, CircleCheck, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { readStoredAuth } from '../api/auth'
import { getDashboardSummary } from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

export default function Dashboard() {
  const authenticated = Boolean(readStoredAuth())
  const summaryQuery = useApiQuery('dashboard-summary', getDashboardSummary, authenticated)
  const summary = summaryQuery.data
  const stats = [
    { label: 'Jobs discovered', value: summary?.jobs?.discoveredCount, icon: Search, note: 'Not included in the current summary response' },
    { label: 'Saved jobs', value: summary?.jobs?.savedCount, icon: BriefcaseBusiness, note: 'Saved job records' },
    { label: 'Applications', value: summary?.applications?.totalCount, icon: Activity, note: 'Confirmed application records' },
  ]

  return (
    <div>
      <div className="page-header">
        <div><h1>Good to see you</h1><p>Your job search at a glance</p></div>
      </div>
      {!authenticated && <div className="notice" role="alert">Sign in to load dashboard data.</div>}
      {summaryQuery.error && <div className="notice" role="alert">{summaryQuery.error}</div>}
      {summaryQuery.loading && <div className="notice" role="status">Loading dashboard summary...</div>}
      <div className="grid-3">
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <div className="stat-card-top"><span>{stat.label}</span><div className="stat-card-icon"><stat.icon size={17} /></div></div>
            <div className="stat-value">{stat.value ?? 'Unavailable'}</div><div className="stat-note">{stat.note}</div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-header"><h2>Application pipeline</h2><Link className="badge" to="/applications">View all</Link></div>
          <div className="card-body">
            {summary?.dataStatus.applications === 'unavailable' || !summary?.applications
              ? <p>Application summary is unavailable.</p>
              : Object.entries(summary.applications.byStatus).map(([status, count]) => <p key={status}>{status}: {count}</p>)}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Profile completeness</h2><Link className="badge" to="/profile">Open profile</Link></div>
          <div className="card-body">
            {summary?.dataStatus.profile === 'unavailable' || !summary?.profile
              ? <p>Profile completeness is unavailable.</p>
              : <><p>{summary.profile.completionPercent}% complete</p>{summary.profile.missingFields.length > 0 && <p>Missing: {summary.profile.missingFields.join(', ')}</p>}</>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Recent matching jobs</h2><Link className="badge" to="/jobs">Discover jobs</Link></div>
          <div className="card-body"><p>Use Discover Jobs to search current supported sources.</p></div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Recent activity</h2><Link className="badge" to="/activity">View activity</Link></div>
          <div className="card-body">
            {!summary?.recentActivity
              ? <p>Recent activity is unavailable.</p>
              : summary.recentActivity.length
                ? summary.recentActivity.map((event) => <p key={event.eventId}><CircleCheck size={14}/> {event.summary}</p>)
                : <p>No recent activity.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Resumes</h2><Link className="badge" to="/resumes">Manage resumes</Link></div>
          <div className="card-body">
            {summary?.dataStatus.resumes === 'unavailable' || !summary?.resumes
              ? <p>Resume summary is unavailable.</p>
              : <p>{summary.resumes.totalCount} resumes stored.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
