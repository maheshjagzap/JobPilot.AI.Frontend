import { useState } from 'react'
import { LogOut, Moon, Sun, Monitor } from 'lucide-react'

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('jobpilot-theme') || 'light')
  function choose(value: string) {
    setTheme(value)
    document.documentElement.dataset.theme = value === 'dark' ? 'dark' : 'light'
    localStorage.setItem('jobpilot-theme', value === 'dark' ? 'dark' : 'light')
  }
  return (
    <div>
      <div className="page-header"><div><h1>Settings</h1><p>Workspace preferences and security</p></div></div>
      <div className="grid-2">
        <div className="card"><div className="card-header"><h2>Appearance</h2></div><div className="card-body" style={{display:'flex',gap:8}}>
          <button className={`secondary-button ${theme==='light'?'active':''}`} onClick={()=>choose('light')}><Sun size={17}/>Light</button>
          <button className={`secondary-button ${theme==='dark'?'active':''}`} onClick={()=>choose('dark')}><Moon size={17}/>Dark</button>
          <button className="secondary-button" onClick={()=>choose('light')}><Monitor size={17}/>System</button>
        </div></div>
        <div className="card"><div className="card-header"><h2>Integrations</h2><span className="badge warning">Unavailable</span></div><div className="card-body" style={{color:'var(--muted)',fontSize:13}}>No connected integrations are assumed. AI providers, Gmail, and career-site adapters require verified backend support.</div></div>
        <div className="card"><div className="card-header"><h2>Job discovery</h2><span className="badge warning">Unavailable</span></div><div className="card-body" style={{color:'var(--muted)',fontSize:13}}>Discovery preferences can be added after a backend preferences contract exists.</div></div>
        <div className="card"><div className="card-header"><h2>Security</h2></div><div className="card-body"><button className="danger-button" onClick={()=>{sessionStorage.removeItem('jobpilot-auth');window.location.assign('/login')}}><LogOut size={17}/>Log out</button></div></div>
      </div>
    </div>
  )
}
