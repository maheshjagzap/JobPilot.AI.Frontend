import { useState } from 'react'
import { CheckSquare, ShieldCheck, WandSparkles } from 'lucide-react'

export default function AIApply({ review = false }: { review?: boolean }) {
  const [approved, setApproved] = useState(false)
  const fields = [
    ['Full name', 'Candidate profile', 'Needs confirmation'],
    ['Email', 'Candidate profile', 'Needs confirmation'],
    ['Work authorization', 'Not provided', 'Sensitive - user review required'],
    ['Visa sponsorship', 'Not provided', 'Sensitive - user review required'],
    ['Salary expectation', 'Not provided', 'Sensitive - user review required'],
  ]
  return (
    <div>
      <div className="page-header"><div><h1>{review ? 'Review application' : 'AI Apply Agent'}</h1><p>{review ? 'Review every proposed answer before any submission' : 'Prepare applications with AI assistance. You stay in control.'}</p></div></div>
      <div className="notice"><ShieldCheck size={18}/><span>Browser automation and application submission are planned capabilities. No submission button can perform a real action.</span></div>
      {!review ? <div className="grid-2">
        <div className="card"><div className="card-header"><h2>Preparation queue</h2><span className="badge warning">No API</span></div><div className="empty-state"><WandSparkles size={28}/><h3>Preparation unavailable</h3><p>Saved jobs and backend preparation endpoints are required.</p></div></div>
        <div className="card"><div className="card-header"><h2>Automation status</h2><span className="badge warning">Not implemented</span></div><div className="empty-state"><ShieldCheck size={28}/><h3>Waiting for verified backend</h3><p>Career adapters and browser-session status are not assumed.</p></div></div>
      </div> : <div className="card">
        <div className="card-header"><h2>Proposed application fields</h2><span className="badge warning">Draft only</span></div>
        <div className="table-wrap"><table><thead><tr><th>Field</th><th>Answer source</th><th>Review state</th></tr></thead><tbody>{fields.map((row)=><tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td><span className="badge warning">{row[2]}</span></td></tr>)}</tbody></table></div>
        <div className="card-body">
          <label style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13}}>
            <input type="checkbox" checked={approved} onChange={(event)=>setApproved(event.target.checked)} />
            <span>I reviewed the proposed answers, sensitive questions, legal declarations, and consent statements myself.</span>
          </label>
          <div className="header-actions" style={{marginTop:18}}><button className="secondary-button">Save draft</button><button className="primary-button" disabled={!approved}><CheckSquare size={17}/>Submit application</button></div>
        </div>
      </div>}
    </div>
  )
}
