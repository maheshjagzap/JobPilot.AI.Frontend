import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bot, ShieldAlert } from 'lucide-react'
import { readStoredAuth } from '../api/auth'
import { cancelAutomationRun, getAutomationRun, listAutomationRuns } from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

function isTerminal(status: string) {
  return ['completed', 'failed', 'cancelled'].includes(status)
}

export default function Automation({ detail = false }: { detail?: boolean }) {
  const { runId = '' } = useParams()
  const [statusFilter, setStatusFilter] = useState('')
  const authenticated = Boolean(readStoredAuth())
  const runsQuery = useApiQuery(`automation-runs:${statusFilter}`, () => listAutomationRuns({ status: statusFilter, pageSize: 20 }), authenticated && !detail)
  const runQuery = useApiQuery(`automation-run:${runId}`, () => getAutomationRun(runId), authenticated && detail && Boolean(runId))
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const runStatus = runQuery.data?.status

  useEffect(() => {
    if (!detail || !runId || !runStatus || isTerminal(runStatus)) return
    const timer = window.setInterval(runQuery.refetch, 3000)
    return () => window.clearInterval(timer)
  }, [detail, runId, runStatus, runQuery.refetch])

  async function cancelRun() {
    setBusy(true)
    setActionError('')
    try {
      await cancelAutomationRun(runId)
      runQuery.refetch()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Could not request cancellation.')
    } finally {
      setBusy(false)
    }
  }

  const error = detail ? runQuery.error : runsQuery.error
  const loading = detail ? runQuery.loading : runsQuery.loading

  return (
    <div>
      <div className="page-header"><div><h1>{detail ? 'Automation Run' : 'Automation Activity'}</h1><p>Observe backend automation jobs and manual interventions</p></div></div>
      <div className="notice"><ShieldAlert size={18}/><span>CAPTCHA, MFA, credentials, cookies, and anti-bot controls must never be exposed or bypassed.</span></div>
      {!authenticated && <div className="notice" role="alert">Sign in to load automation runs.</div>}
      {error && <div className="notice" role="alert">{error}</div>}
      {actionError && <div className="notice" role="alert">{actionError}</div>}
      {loading && <div className="card"><div className="empty-state" role="status">Loading automation data...</div></div>}
      {detail && runQuery.data && !loading && !error && <div className="card">
        <div className="card-header">
          <h2>Run {runQuery.data.runId}</h2><span className="badge">{runQuery.data.status}</span>
          {!isTerminal(runQuery.data.status) && <button className="secondary-button" type="button" disabled={busy} onClick={() => { void cancelRun() }}>{busy ? 'Requesting...' : 'Request cancellation'}</button>}
        </div>
        <div className="card-body">
          {runQuery.data.currentStep && <p>{runQuery.data.currentStep}</p>}
          {runQuery.data.applicationId && <p>Confirmed application: {runQuery.data.applicationId}</p>}
          {runQuery.data.events?.map((event) => <p key={event.eventId}>{event.summary} · {new Date(event.occurredAt).toLocaleString()}</p>)}
        </div>
      </div>}
      {!detail && !loading && !error && authenticated && <div className="card">
        <div className="card-header">
          <h2>Runs</h2>
          <select aria-label="Filter runs by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="queued">Queued</option><option value="running">Running</option>
            <option value="waiting_for_user">Waiting for you</option><option value="completed">Completed</option>
            <option value="failed">Failed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        {runsQuery.data?.items.length
          ? <div className="table-wrap"><table>
            <thead><tr><th>Run</th><th>Status</th><th>Started</th><th>Updated</th></tr></thead>
            <tbody>{runsQuery.data.items.map((run) => <tr key={run.runId}>
              <td><Link to={`/automation/${encodeURIComponent(run.runId)}`}>{run.runId}</Link></td>
              <td>{run.status}</td><td>{run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}</td><td>{new Date(run.updatedAt).toLocaleString()}</td>
            </tr>)}</tbody>
          </table></div>
          : <div className="empty-state"><Bot size={30}/><h3>No automation runs</h3><p>A successful empty response means no runs are available.</p></div>}
      </div>}
    </div>
  )
}
