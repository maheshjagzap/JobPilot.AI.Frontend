import { Upload, FileText } from 'lucide-react'

export default function Resumes() {
  return (
    <div>
      <div className="page-header"><div><h1>Resumes</h1><p>Manage source resumes and tailored versions</p></div><div className="header-actions"><button className="primary-button" disabled><Upload size={17}/>Upload resume</button></div></div>
      <div className="notice"><FileText size={18}/><span>Upload and secure file download are unavailable until the resume API and server-side validation limits are implemented.</span></div>
      <div className="card"><div className="empty-state"><FileText size={30}/><h3>No resume records available</h3><p>Resume records are never fabricated. Supported formats and size limits will come from the backend configuration.</p></div></div>
    </div>
  )
}
