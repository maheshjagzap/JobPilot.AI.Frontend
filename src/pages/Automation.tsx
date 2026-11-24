import { Bot, ShieldAlert } from 'lucide-react'

export default function Automation({ detail = false }: { detail?: boolean }) {
  return (
    <div>
      <div className="page-header"><div><h1>{detail ? 'Automation Run' : 'Automation Activity'}</h1><p>Observe browser automation jobs and manual interventions</p></div></div>
      <div className="notice"><ShieldAlert size={18}/><span>Automation is not available. CAPTCHA, MFA, credentials, cookies, and anti-bot controls must never be exposed or bypassed.</span></div>
      <div className="card"><div className="empty-state"><Bot size={30}/><h3>{detail ? 'Run details unavailable' : 'No automation runs'}</h3><p>A backend automation adapter and safe audit endpoint are required before any run appears here.</p></div></div>
    </div>
  )
}
