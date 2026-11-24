import { Activity as ActivityIcon } from 'lucide-react'

export default function Activity() {
  return (
    <div>
      <div className="page-header"><div><h1>Activity Centre</h1><p>Important product and automation events</p></div></div>
      <div className="notice"><ActivityIcon size={18}/><span>Only backend audit events should appear here. No sample activity is displayed.</span></div>
      <div className="card"><div className="empty-state"><ActivityIcon size={30}/><h3>No verified activity</h3><p>Connect an activity/audit endpoint to show job discovery, resume, matching, approval, and submission events.</p></div></div>
    </div>
  )
}
