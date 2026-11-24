import { useState } from 'react'
import { Save, UserRound } from 'lucide-react'

export default function Profile() {
  const [tab, setTab] = useState('Personal')
  const tabs = ['Personal', 'Experience', 'Education', 'Skills', 'Preferences', 'Relocation']
  return (
    <div>
      <div className="page-header"><div><h1>Candidate Profile</h1><p>Your verified source of truth</p></div><div className="header-actions"><button className="secondary-button">Cancel</button><button className="primary-button"><Save size={17}/>Save changes</button></div></div>
      <div className="notice"><UserRound size={18}/><span>Profile saving is disabled until the real profile DTO and API endpoint are provided.</span></div>
      <div className="card">
        <div className="tabs" role="tablist">{tabs.map((item)=><button key={item} className={`tab ${tab===item?'active':''}`} onClick={()=>setTab(item)}>{item}</button>)}</div>
        <div className="card-body">
          <div className="form-grid">
            {tab === 'Personal' && <>
              <div className="field"><label htmlFor="name">Full legal name</label><input id="name" placeholder="Your full name"/></div>
              <div className="field"><label htmlFor="preferred">Preferred name</label><input id="preferred" placeholder="Optional"/></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" placeholder="you@example.com"/></div>
              <div className="field"><label htmlFor="phone">Phone</label><input id="phone" placeholder="+91..."/></div>
              <div className="field"><label htmlFor="city">Current city</label><input id="city" placeholder="City"/></div>
              <div className="field"><label htmlFor="country">Country</label><input id="country" placeholder="Country"/></div>
              <div className="field full"><label htmlFor="summary">Professional summary</label><textarea id="summary" placeholder="Summarize your experience without exaggeration"/></div>
            </>}
            {tab === 'Experience' && <><div className="field"><label>Job title</label><input placeholder="Current job title"/></div><div className="field"><label>Employer</label><input placeholder="Company"/></div><div className="field"><label>Start date</label><input type="date"/></div><div className="field"><label>End date</label><input type="date"/></div><div className="field full"><label>Responsibilities and achievements</label><textarea placeholder="Describe verified responsibilities"/></div></>}
            {tab === 'Education' && <><div className="field"><label>Institution</label><input/></div><div className="field"><label>Degree</label><input/></div><div className="field"><label>Field of study</label><input/></div><div className="field"><label>End year</label><input type="number"/></div></>}
            {tab === 'Skills' && <><div className="field"><label>Skill name</label><input placeholder="e.g. ASP.NET Core"/></div><div className="field"><label>Category</label><select><option>Backend</option><option>Frontend</option><option>Cloud</option><option>Tools</option></select></div><div className="field full"><label>Supporting experience</label><textarea placeholder="Describe the evidence for this skill"/></div></>}
            {tab === 'Preferences' && <><div className="field"><label>Target roles</label><input/></div><div className="field"><label>Work model</label><select><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div><div className="field"><label>Minimum salary</label><input type="number"/></div><div className="field"><label>Currency</label><select><option>INR</option><option>USD</option><option>EUR</option></select></div></>}
            {tab === 'Relocation' && <><div className="field"><label>Current country</label><input/></div><div className="field"><label>Willing to relocate</label><select><option>Not specified</option><option>Yes</option><option>No</option></select></div><div className="field full"><label>Work authorization</label><textarea placeholder="List countries and authorization status only if you confirm them"/></div></>}
          </div>
        </div>
      </div>
    </div>
  )
}
