import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { readStoredAuth } from '../api/auth'
import {
  archiveResume,
  downloadResume,
  getResume,
  listResumes,
  setPrimaryResume,
  uploadResume,
  type Resume,
} from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

export default function Resumes() {
  const authenticated = Boolean(readStoredAuth())
  const resumesQuery = useApiQuery('resumes', () => listResumes(1, 20), authenticated)
  const [detailId, setDetailId] = useState('')
  const [detail, setDetail] = useState<Resume>()
  const [file, setFile] = useState<File>()
  const [resumeName, setResumeName] = useState('')
  const [resumeKind, setResumeKind] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const [setAsDefault, setSetAsDefault] = useState(false)
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function uploadSelected() {
    if (!file) return
    setPending('upload')
    setError('')
    setStatus('')
    try {
      const result = await uploadResume(file, {
        resumeName: resumeName.trim(),
        resumeKind: resumeKind.trim(),
        setAsDefault,
      })
      setStatus(`Upload accepted. Import status: ${result.importStatus}.`)
      setFile(undefined)
      if (fileInput.current) fileInput.current.value = ''
      setResumeName('')
      setResumeKind('')
      setSetAsDefault(false)
      resumesQuery.refetch()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Resume upload failed.')
    } finally {
      setPending('')
    }
  }

  async function runAction(resumeId: string, action: 'default' | 'archive' | 'download' | 'detail') {
    setPending(resumeId)
    setError('')
    setStatus('')
    try {
      if (action === 'default') {
        await setPrimaryResume(resumeId)
        setStatus('Default resume updated.')
        resumesQuery.refetch()
      } else if (action === 'archive') {
        await archiveResume(resumeId)
        setStatus('Resume archived.')
        resumesQuery.refetch()
      } else if (action === 'detail') {
        setDetail(await getResume(resumeId))
        setDetailId(resumeId)
      } else {
        const blob = await downloadResume(resumeId)
        const resume = resumesQuery.data?.items.find((item) => item.resumeId === resumeId)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = resume?.importJob.originalFileName || resume?.resumeName || 'resume'
        anchor.click()
        window.setTimeout(() => URL.revokeObjectURL(url), 0)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Resume request failed.')
    } finally {
      setPending('')
    }
  }

  return (
    <div>
      <div className="page-header"><div><h1>Resumes</h1><p>Manage source resumes and tailored versions</p></div></div>
      {!authenticated && <div className="notice" role="alert">Sign in to load and manage resumes.</div>}
      {authenticated && resumesQuery.error && <div className="notice" role="alert">{resumesQuery.error}</div>}
      {error && <div className="notice" role="alert">{error}</div>}
      {status && <div className="notice" role="status">{status}</div>}
      {authenticated && <div className="card">
        <div className="card-header"><h2>Upload a resume</h2></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="resume-file">Resume file *</label>
              <input id="resume-file" ref={fileInput} type="file" onChange={(event) => {
                const selected = event.target.files?.[0]
                setFile(selected)
                if (selected && !resumeName.trim()) {
                  setResumeName(selected.name.replace(/\.[^.]+$/, ''))
                }
              }}/>
            </div>
            <div className="field">
              <label htmlFor="resume-name">Resume name</label>
              <input id="resume-name" value={resumeName} onChange={(event) => setResumeName(event.target.value)}/>
            </div>
            <div className="field">
              <label htmlFor="resume-kind">Resume kind</label>
              <input id="resume-kind" value={resumeKind} onChange={(event) => setResumeKind(event.target.value)}/>
            </div>
            <label className="work-mode-option full">
              <input type="checkbox" checked={setAsDefault} onChange={(event) => setSetAsDefault(event.target.checked)}/>
              <span>Set as default resume</span>
            </label>
            <div className="form-action full">
              <button className="primary-button" type="button" disabled={!file || pending === 'upload'} onClick={() => { void uploadSelected() }}>
                <Upload size={17}/>{pending === 'upload' ? 'Uploading...' : 'Upload resume'}
              </button>
            </div>
          </div>
          <p>Supported formats and file-size limits are enforced by the backend.</p>
        </div>
      </div>}
      {resumesQuery.loading && <div className="card"><div className="empty-state" role="status">Loading resumes...</div></div>}
      {authenticated && !resumesQuery.loading && !resumesQuery.error && (
        <div className="card">
          {!resumesQuery.data?.items.length ? <div className="empty-state"><FileText size={30}/><h3>No resumes uploaded</h3><p>Uploaded files and their processing status will appear here.</p></div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Name</th><th>Kind</th><th>Import status</th><th>Default</th><th>Actions</th></tr></thead>
              <tbody>{resumesQuery.data.items.map((resume) => (
                <tr key={resume.resumeId}>
                  <td>{resume.resumeName}{resume.isArchived && ' (archived)'}</td>
                  <td>{resume.resumeKind}</td>
                  <td>{resume.importJob.importStatus}</td>
                  <td>{resume.isDefault ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="header-actions">
                      <button className="secondary-button" type="button" disabled={pending === resume.resumeId} onClick={() => { void runAction(resume.resumeId, 'download') }}>Download</button>
                      <button className="secondary-button" type="button" disabled={pending === resume.resumeId || resume.isDefault || resume.isArchived} onClick={() => { void runAction(resume.resumeId, 'default') }}>Set default</button>
                      <button className="secondary-button" type="button" disabled={pending === resume.resumeId} onClick={() => { void runAction(resume.resumeId, 'detail') }}>Details</button>
                      <button className="secondary-button" type="button" disabled={pending === resume.resumeId || resume.isArchived} onClick={() => { void runAction(resume.resumeId, 'archive') }}>Archive</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}
      {detailId && detail && <div className="card">
        <div className="card-header"><h2>Resume details</h2><button className="secondary-button" type="button" onClick={() => { setDetailId(''); setDetail(undefined) }}>Close</button></div>
        <div className="card-body">
          <p>{detail.resumeName} · {detail.resumeKind}</p>
          <p>Original file: {detail.importJob.originalFileName} · {detail.importJob.contentType} · {detail.importJob.fileSizeBytes} bytes</p>
          <p>Import status: {detail.importJob.importStatus} · Current version: {detail.currentVersionNumber}</p>
          <h3>Versions</h3>
          {detail.versions.length
            ? <ul>{detail.versions.map((version) => <li key={version.resumeVersionId}>Version {version.versionNumber}{version.versionLabel ? ` — ${version.versionLabel}` : ''} · {new Date(version.createdAt).toLocaleDateString()}</li>)}</ul>
            : <p>No versions listed.</p>}
        </div>
      </div>}
    </div>
  )
}
