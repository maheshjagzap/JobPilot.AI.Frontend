import { Search, SlidersHorizontal, Bookmark, WifiOff } from 'lucide-react'

export default function Jobs({ saved = false, detail = false, match = false }: { saved?: boolean; detail?: boolean; match?: boolean }) {
  const title = match ? 'Match Analysis' : detail ? 'Job Details' : saved ? 'Saved Jobs' : 'Discover Jobs'
  return (
    <div>
      <div className="page-header"><div><h1>{title}</h1><p>{match ? 'Transparent backend-calculated fit analysis' : detail ? 'Review a discovered opportunity' : 'Search and filter discovered opportunities'}</p></div></div>
      {!match && !detail && <div className="toolbar">
        <div className="search-field"><Search size={17}/><input placeholder={saved ? 'Search saved jobs' : 'Search title or keyword'} aria-label="Search jobs"/></div>
        <button className="secondary-button"><SlidersHorizontal size={17}/>Filters</button>
      </div>}
      <div className="notice"><WifiOff size={18}/><span><strong>Discovery data unavailable.</strong> This screen requires implemented job search, saved-job, detail, or match endpoints.</span></div>
      {match ? <div className="card"><div className="empty-state"><Bookmark size={30}/><h3>Match analysis unavailable</h3><p>No match score or fabricated explanation is shown because backend matching logic has not been inspected.</p></div></div> :
      <div className="card"><div className="empty-state"><Search size={30}/><h3>{detail ? 'Job details unavailable' : saved ? 'No saved jobs data' : 'No discovered jobs'}</h3><p>Connect the real ASP.NET Core endpoint before listing any opportunities.</p>{!detail&&!saved&&<button className="secondary-button" disabled>Search unavailable</button>}</div></div>}
    </div>
  )
}
