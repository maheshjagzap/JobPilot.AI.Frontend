import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, CalendarDays, Search, Sparkles } from 'lucide-react'

const sources = ['All applications', 'LinkedIn', 'Naukri', 'Indeed', 'Gmail', 'Company career pages']

export default function Applications({ detail = false }: { detail?: boolean }) {
  const [selectedSource, setSelectedSource] = useState('All applications')
  const [showCampusDrives, setShowCampusDrives] = useState(false)
  const navigate = useNavigate()

  function askAboutCampusDrives() {
    navigate('/agent', {
      state: {
        initialCommand: 'Find upcoming campus drives and show me the dates, eligibility, and official source links.',
      },
    })
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>{detail ? 'Application Details' : 'Applications'}</h1><p>Review applications by where you applied</p></div>
      </div>
      <div className="notice"><BriefcaseBusiness size={18}/><span>Application sources and statuses will be shown only when confirmed by backend records.</span></div>
      <div className="card">
        {detail ? (
          <div className="empty-state"><BriefcaseBusiness size={28}/><h3>Application details unavailable</h3><p>The requested application cannot be loaded because no backend record endpoint exists.</p></div>
        ) : (
          <>
            <div className="tabs application-tabs" role="tablist" aria-label="Application sources">
              {sources.map((source) => (
                <button
                  aria-selected={!showCampusDrives && selectedSource === source}
                  className={`tab ${!showCampusDrives && selectedSource === source ? 'active' : ''}`}
                  key={source}
                  onClick={() => { setSelectedSource(source); setShowCampusDrives(false) }}
                  role="tab"
                  type="button"
                >{source}</button>
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
            ) : (
              <section role="tabpanel" aria-label={`${selectedSource} applications`}>
                <div className="card-header">
                  <h2>{selectedSource}</h2>
                  <div className="search-field" style={{height:34,maxWidth:220}}><Search size={15}/><input aria-label="Search applications" placeholder="Search applications"/></div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th></tr></thead>
                    <tbody><tr><td colSpan={4}><div className="empty-state"><BriefcaseBusiness size={28}/><h3>No confirmed application records</h3><p>Applications from {selectedSource === 'All applications' ? 'all sources' : selectedSource} will appear here once the backend provides verified records.</p></div></td></tr></tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
