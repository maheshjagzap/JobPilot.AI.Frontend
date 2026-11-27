import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckSquare, ShieldCheck, WandSparkles } from 'lucide-react'
import { readStoredAuth } from '../api/auth'
import {
  approvePreparation,
  createPreparation,
  getPreparation,
  listResumes,
  listSavedJobs,
  submitPreparation,
  updatePreparation,
  type ApplicationPreparation,
} from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

export default function AIApply({ review = false }: { review?: boolean }) {
  const navigate = useNavigate()
  const { runId = '' } = useParams()
  const authenticated = Boolean(readStoredAuth())
  const jobsQuery = useApiQuery('saved-jobs-for-apply', () => listSavedJobs({ pageSize: 50 }), authenticated && !review)
  const resumesQuery = useApiQuery('resumes-for-apply', () => listResumes(1, 50), authenticated && !review)
  const preparationQuery = useApiQuery(`preparation:${runId}`, () => getPreparation(runId), authenticated && review && Boolean(runId))
  const [jobId, setJobId] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [answersDraft, setAnswersDraft] = useState<ApplicationPreparation['answers']>()
  const [approved, setApproved] = useState(false)
  const [approval, setApproval] = useState<{ approvalId: string; approvedVersion: number }>()
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [versionOverride, setVersionOverride] = useState<number>()
  const answers = answersDraft ?? preparationQuery.data?.answers ?? []
  const version = versionOverride ?? preparationQuery.data?.version ?? 0
  const preparationStatus = preparationQuery.data?.status

  useEffect(() => {
    if (!review || !runId || preparationStatus !== 'preparing') return
    const timer = window.setInterval(preparationQuery.refetch, 2500)
    return () => window.clearInterval(timer)
  }, [review, runId, preparationStatus, preparationQuery.refetch])

  async function beginPreparation() {
    if (!jobId || !resumeId) return
    setBusy('prepare')
    setError('')
    try {
      const result = await createPreparation(jobId, resumeId)
      navigate(`/ai-apply/${encodeURIComponent(result.preparationId)}/review`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not prepare this application.')
    } finally {
      setBusy('')
    }
  }

  async function saveDraft() {
    if (!preparationQuery.data || version === 0) return
    setBusy('save')
    setError('')
    setStatus('')
    try {
      const result = await updatePreparation(runId, version, answers)
      setVersionOverride(result.version)
      setDirty(false)
      setApproved(false)
      setApproval(undefined)
      setStatus('Draft saved. Review it again before approving.')
      preparationQuery.refetch()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this draft.')
    } finally {
      setBusy('')
    }
  }

  async function approveDraft() {
    if (!approved || version === 0) return
    setBusy('approve')
    setError('')
    try {
      const result = await approvePreparation(runId, version)
      setApproval({ approvalId: result.approvalId, approvedVersion: result.approvedVersion })
      setStatus('This exact draft version is approved. Submit only if you intend to proceed.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not record approval.')
    } finally {
      setBusy('')
    }
  }

  async function submitApprovedDraft() {
    if (!approval) return
    setBusy('submit')
    setError('')
    try {
      const result = await submitPreparation(runId, approval.approvalId, approval.approvedVersion)
      navigate(`/automation/${encodeURIComponent(result.runId)}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit the approved application.')
    } finally {
      setBusy('')
    }
  }

  const pageError = review ? preparationQuery.error : jobsQuery.error || resumesQuery.error

  return (
    <div>
      <div className="page-header"><div><h1>{review ? 'Review application' : 'Prepare application'}</h1><p>{review ? 'Review every proposed answer before any submission' : 'Choose a saved job and resume to create a draft'}</p></div></div>
      <div className="notice"><ShieldCheck size={18}/><span>Submission requires review and explicit approval. Queued work is not a confirmed application.</span></div>
      {!authenticated && <div className="notice" role="alert">Sign in to use application preparation.</div>}
      {pageError && <div className="notice" role="alert">{pageError}</div>}
      {error && <div className="notice" role="alert">{error}</div>}
      {status && <div className="notice" role="status">{status}</div>}
      {!review && authenticated && (
        <div className="card">
          <div className="card-header"><h2>Preparation queue</h2></div>
          <div className="card-body">
            {jobsQuery.loading || resumesQuery.loading ? <p role="status">Loading saved jobs and resumes...</p> : <>
              <div className="field">
                <label htmlFor="apply-job">Saved job</label>
                <select id="apply-job" value={jobId} onChange={(event) => setJobId(event.target.value)}>
                  <option value="">Select a saved job</option>
                  {jobsQuery.data?.items.map((job) => <option value={job.jobId} key={job.jobId}>{job.title} — {job.company}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="apply-resume">Resume</label>
                <select id="apply-resume" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
                  <option value="">Select a resume</option>
                  {resumesQuery.data?.items.filter((resume) => !resume.isArchived).map((resume) => <option value={resume.resumeId} key={resume.resumeId}>{resume.resumeName} — {resume.importJob.importStatus}{resume.isDefault ? ' (default)' : ''}</option>)}
                </select>
              </div>
              <button className="primary-button" type="button" disabled={!jobId || !resumeId || busy === 'prepare'} onClick={() => { void beginPreparation() }}>
                <WandSparkles size={17}/>{busy === 'prepare' ? 'Preparing...' : 'Create draft'}
              </button>
            </>}
          </div>
        </div>
      )}
      {review && authenticated && (preparationQuery.loading || preparationStatus === 'preparing') && <div className="card"><div className="empty-state" role="status">Loading application draft...</div></div>}
      {review && preparationQuery.data && preparationStatus !== 'draft' && preparationStatus !== 'preparing' && !pageError && (
        <div className="notice" role="status">Preparation status: {preparationStatus}. Submission remains unavailable until a reviewable draft is returned.</div>
      )}
      {review && preparationQuery.data && preparationStatus === 'draft' && !preparationQuery.loading && !pageError && (
        <div className="card">
          <div className="card-header"><h2>Proposed application fields</h2><span className="badge warning">Draft · version {version}</span></div>
          <div className="table-wrap">
            <table><thead><tr><th>Field</th><th>Proposed answer</th><th>Source / review</th></tr></thead>
              <tbody>{answers.map((answer, index) => (
                <tr key={answer.field}>
                  <td><strong>{answer.field}</strong></td>
                  <td><input aria-label={`Answer for ${answer.field}`} value={answer.value} onChange={(event) => {
                    setAnswersDraft(answers.map((item, itemIndex) => itemIndex === index
                      ? { ...item, value: event.target.value, source: 'user_input', confirmedByUser: true }
                      : item))
                    setDirty(true)
                    setApproved(false)
                    setApproval(undefined)
                  }}/></td>
                  <td>{answer.sensitive ? 'Sensitive — review required' : answer.source}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="card-body">
            <button className="secondary-button" type="button" disabled={busy !== ''} onClick={() => { void saveDraft() }}>{busy === 'save' ? 'Saving...' : 'Save draft'}</button>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, marginTop: 16 }}>
              <input type="checkbox" checked={approved} onChange={(event) => { setApproved(event.target.checked); setApproval(undefined) }}/>
              <span>I reviewed the company, role, resume, every answer, sensitive fields, legal declarations, and consent statements myself.</span>
            </label>
            {!approval
              ? <button className="primary-button" type="button" disabled={!approved || dirty || busy !== ''} onClick={() => { void approveDraft() }}><CheckSquare size={17}/>{busy === 'approve' ? 'Recording approval...' : dirty ? 'Save changes before approval' : 'Approve this version'}</button>
              : <button className="primary-button" type="button" disabled={busy !== ''} onClick={() => { void submitApprovedDraft() }}>{busy === 'submit' ? 'Submitting...' : 'Submit approved application'}</button>}
          </div>
        </div>
      )}
    </div>
  )
}
