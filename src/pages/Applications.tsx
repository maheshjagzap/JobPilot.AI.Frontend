import { BriefcaseBusiness, Search } from 'lucide-react'

export default function Applications({ detail = false }: { detail?: boolean }) {
  return (
    <div>
      <div className="page-header"><div><h1>{detail ? 'Application Details' : 'Applications'}</h1><p>Track progress through the application pipeline</p></div><div className="header-actions"><button className="primary-button" disabled>Create draft</button></div></div>
      <div className="notice"><BriefcaseBusiness size={18}/><span>Application records and status updates require verified backend status enums and API routes.</span></div>
      <div className="card">
        {!detail && <><div className="card-header"><h2>Application pipeline</h2><div className="search-field" style={{height:34,maxWidth:220}}><Search size={15}/><input placeholder="Search applications"/></div></div>
        <div className="table-wrap"><table><thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Updated</th></tr></thead><tbody><tr><td colSpan={4}><div className="empty-state"><BriefcaseBusiness size={28}/><h3>No application records</h3><p>No records are shown until the applications API confirms them.</p></div></td></tr></tbody></table></div></>}
        {detail && <div className="empty-state"><BriefcaseBusiness size={28}/><h3>Application details unavailable</h3><p>The requested application cannot be loaded because no backend record endpoint exists.</p></div>}
      </div>
    </div>
  )
}
