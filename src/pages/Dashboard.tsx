import { Activity, BriefcaseBusiness, CalendarClock, CircleCheck, Search, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const stats = [
    { label: 'Jobs discovered', value: 'Unavailable', icon: Search, note: 'Requires discovery API' },
    { label: 'Saved jobs', value: 'Unavailable', icon: BriefcaseBusiness, note: 'Requires jobs API' },
    { label: 'Applications in progress', value: 'Unavailable', icon: Activity, note: 'Requires applications API' },
  ]
  return (
    <div>
      <div className="page-header">
        <div><h1>Good to see you</h1><p>Your job search at a glance</p></div>
        <div className="header-actions"><button className="secondary-button"><CalendarClock size={17} /> Date range unavailable</button></div>
      </div>
      <div className="notice"><Activity size={18} /><span><strong>Backend not connected.</strong> Metrics are not displayed until the ASP.NET Core API contract is available.</span></div>
      <div className="grid-3">
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <div className="stat-card-top"><span>{stat.label}</span><div className="stat-card-icon"><stat.icon size={17} /></div></div>
            <div className="stat-value">{stat.value}</div><div className="stat-note">{stat.note}</div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card"><div className="card-header"><h2>Application pipeline</h2><Link className="badge" to="/applications">View all</Link></div><div className="empty-state"><BriefcaseBusiness size={28}/><h3>No application data</h3><p>Pipeline stages will appear after application endpoints and status enums are available.</p></div></div>
        <div className="card"><div className="card-header"><h2>Profile completeness</h2><Link className="badge" to="/profile">Open profile</Link></div><div className="empty-state"><UserRound size={28}/><h3>Profile not loaded</h3><p>Candidate completeness cannot be calculated without a profile API.</p></div></div>
        <div className="card"><div className="card-header"><h2>Recent matching jobs</h2><Link className="badge" to="/jobs">Discover jobs</Link></div><div className="empty-state"><Search size={28}/><h3>No discovery data</h3><p>No demo or fabricated jobs are shown.</p></div></div>
        <div className="card"><div className="card-header"><h2>Recent activity</h2><Link className="badge" to="/activity">View activity</Link></div><div className="empty-state"><CircleCheck size={28}/><h3>No activity yet</h3><p>Backend audit events will appear here.</p></div></div>
      </div>
    </div>
  )
}
