import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BriefcaseBusiness, CalendarDays, Search, Sparkles } from 'lucide-react'
import { getApplication, listApplications } from '../api/features'
import { readStoredAuth } from '../api/auth'
import { useApiQuery } from '../api/useApiQuery'

const sources = [
  { label: 'All applications', value: undefined },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Naukri', value: 'naukri' },
  { label: 'Indeed', value: 'indeed' },
  { label: 'Gmail', value: 'gmail' },
  { label: 'Company career pages', value: 'company_site' },
]

export default function Applications({ detail = false }: { detail?: boolean }) {
  const [selectedSource, setSelectedSource] = useState(sources[0])
  const [showCampusDrives, setShowCampusDrives] = useState(false)
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const { applicationId = '' } = useParams()
  const authenticated = Boolean(readStoredAuth())
  const listQuery = useApiQuery(
    `applications:${selectedSource.value ?? 'all'}:${submittedSearch}:${status}`,
    () => listApplications({ source: selectedSource.value, status, q: submittedSearch, pageSize: 20 }),
    authenticated && !detail,
  )
  const detailQuery = useApiQuery(
    `application:${applicationId}`,
    () => getApplication(applicationId),
    authenticated && detail && Boolean(applicationId),
  )

  function askAboutCampusDrives() {
    navigate('/agent', {
      state: {
        initialCommand: 'Find upcoming campus drives and show me the dates, eligibility, and official source links.',
      },
    })
  }

  const error = detail ? detailQuery.error : listQuery.error
  const loading = detail ? detailQuery.loading : listQuery.loading

  return (
    <div>
      <div className="page-header">
        <div><h1>{detail ? 'Application Details' : 'Applications'}</h1><p>Review applications by where you applied</p></div>
      </div>
      <div className="notice"><BriefcaseBusiness size={18}/><span>Application sources and statuses are shown only from backend records.</span></div>
      {!authenticated && <div className="notice" role="alert">Sign in to load application data.</div>}
      {authenticated && error && <div className="notice" role="alert">{error}</div>}
      {loading && <div className="card"><div className="empty-state" role="status">Loading applications...</div></div>}
      {detail && detailQuery.data && !loading && !error && (
        <div className="card">
          <div className="card-header"><h2>{detailQuery.data.company} · {detailQuery.data.role}</h2><span className="badge">{detailQuery.data.status}</span></div>
          <div className="card-body">
            <p>Source: {detailQuery.data.source}</p>
            <p>Applied: {new Date(detailQuery.data.appliedAt).toLocaleDateString()}</p>
            <h3>Status history</h3>
            {detailQuery.data.events.length
              ? <ul>{detailQuery.data.events.map((event) => <li key={event.eventId}>{event.summary} — {new Date(event.occurredAt).toLocaleString()}</li>)}</ul>
              : <p>No status events are available.</p>}
          </div>
        </div>
      )}
      {!detail && !loading && !error && (
        <div className="card">
          <div className="tabs application-tabs" role="tablist" aria-label="Application sources">
            {sources.map((source) => (
              <button
                aria-selected={!showCampusDrives && selectedSource.label === source.label}
                className={`tab ${!showCampusDrives && selectedSource.label === source.label ? 'active' : ''}`}
                key={source.label}
                onClick={() => { setSelectedSource(source); setShowCampusDrives(false) }}
                role="tab"
                type="button"
              >{source.label}</button>
            ))}
            <button
              aria-selected={showCampusDrives}
              className={`tab campus-tab ${showCampusDrives ? 'active' : ''}`}
              onClick={() => setShowCampusDrives(true)}
              role="tab"
              type="button"
            >Upcoming campus drives</button>
          </div>
          {showCampusDrives ? (
            <section role="tabpanel" aria-label="Upcoming campus drives">
              <div className="card-header"><h2>Upcoming campus drives</h2></div>
              <div className="empty-state">
                <CalendarDays size={28}/>
                <h3>Campus drive listings are not connected</h3>
                <p>No event dates or eligibility details are available yet. Ask JobPilot to look for drives when a supported data source is connected.</p>
                <button className="primary-button" onClick={askAboutCampusDrives} type="button"><Sparkles size={16}/>Ask JobPilot</button>
              </div>
            </section>
          ) : !authenticated ? (
            <section role="tabpanel" aria-label={`${selectedSource.label} applications`}>
              <div className="empty-state"><BriefcaseBusiness size={28}/><h3>Sign in to load applications</h3></div>
            </section>
          ) : (
            <section role="tabpanel" aria-label={`${selectedSource.label} applications`}>
              <div className="card-header">
                <h2>{selectedSource.label}</h2>
                <form className="search-field" style={{ height: 34, maxWidth: 260 }} onSubmit={(event) => { event.preventDefault(); setSubmittedSearch(search.trim()) }}>
                  <Search size={15}/>
                  <input aria-label="Search applications" placeholder="Search applications" value={search} onChange={(event) => setSearch(event.target.value)}/>
                  <button className="sr-only" type="submit">Search</button>
                </form>
                <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {listQuery.data?.items.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th></tr></thead>
                    <tbody>{listQuery.data.items.map((application) => (
                      <tr key={application.applicationId}>
                        <td><Link to={`/applications/${encodeURIComponent(application.applicationId)}`}>{application.company}</Link></td>
                        <td>{application.role}</td><td>{application.status}</td>
                        <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><BriefcaseBusiness size={28}/><h3>No confirmed application records</h3><p>A successful empty response means there are no applications from {selectedSource.label === 'All applications' ? 'any source' : selectedSource.label}.</p></div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
