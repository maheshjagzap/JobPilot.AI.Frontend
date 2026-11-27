import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, Search, SlidersHorizontal, WifiOff } from 'lucide-react'
import { getJob, getJobMatch, listSavedJobs, searchJobs, setJobSaved } from '../api/features'
import { readStoredAuth } from '../api/auth'
import { useApiQuery } from '../api/useApiQuery'

export default function Jobs({ saved = false, detail = false, match = false }: { saved?: boolean; detail?: boolean; match?: boolean }) {
  const { jobId = '' } = useParams()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [postedAfter, setPostedAfter] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [submittedLocation, setSubmittedLocation] = useState('')
  const [submittedWorkMode, setSubmittedWorkMode] = useState('')
  const [submittedEmploymentType, setSubmittedEmploymentType] = useState('')
  const [submittedPostedAfter, setSubmittedPostedAfter] = useState('')
  const [busyJob, setBusyJob] = useState('')
  const [mutationError, setMutationError] = useState('')
  const authenticated = Boolean(readStoredAuth())
  const title = match ? 'Match Analysis' : detail ? 'Job Details' : saved ? 'Saved Jobs' : 'Discover Jobs'
  const jobsQuery = useApiQuery(
    `jobs:${saved}:${submittedQuery}:${submittedLocation}:${submittedWorkMode}:${submittedEmploymentType}:${submittedPostedAfter}`,
    () => saved
      ? listSavedJobs({ q: submittedQuery, pageSize: 20 })
      : searchJobs({
        q: submittedQuery,
        location: submittedLocation,
        workMode: submittedWorkMode,
        employmentType: submittedEmploymentType,
        postedAfter: submittedPostedAfter,
        pageSize: 20,
      }),
    authenticated && !detail && !match,
  )
  const detailQuery = useApiQuery(
    `job:${jobId}`,
    () => getJob(jobId),
    authenticated && Boolean(jobId) && (detail || match),
  )
  const matchQuery = useApiQuery(
    `job-match:${jobId}`,
    () => getJobMatch(jobId),
    authenticated && Boolean(jobId) && match,
  )

  async function toggleSaved(id: string, isSaved: boolean) {
    setBusyJob(id)
    setMutationError('')
    try {
      await setJobSaved(id, !isSaved)
      jobsQuery.refetch()
      detailQuery.refetch()
    } catch (reason) {
      setMutationError(reason instanceof Error ? reason.message : 'Could not update the saved job.')
    } finally {
      setBusyJob('')
    }
  }

  const job = detailQuery.data
  const page = jobsQuery.data
  const loading = detail || match ? detailQuery.loading || (match && matchQuery.loading) : jobsQuery.loading
  const error = detail || match ? detailQuery.error || (match ? matchQuery.error : '') : jobsQuery.error

  return (
    <div>
      <div className="page-header"><div><h1>{title}</h1><p>{match ? 'Transparent backend-calculated fit analysis' : detail ? 'Review a discovered opportunity' : 'Search and filter discovered opportunities'}</p></div></div>
      {!match && !detail && <form className="toolbar" onSubmit={(event) => {
        event.preventDefault()
        setSubmittedQuery(query.trim())
        setSubmittedLocation(location.trim())
        setSubmittedWorkMode(workMode)
        setSubmittedEmploymentType(employmentType)
        setSubmittedPostedAfter(postedAfter)
      }}>
        <div className="search-field"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={saved ? 'Search saved jobs' : 'Search title or keyword'} aria-label="Search jobs"/></div>
        {!saved && <>
          <input aria-label="Location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location"/>
          <select aria-label="Work mode" value={workMode} onChange={(event) => setWorkMode(event.target.value)}>
            <option value="">Any work mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
          </select>
          <select aria-label="Employment type" value={employmentType} onChange={(event) => setEmploymentType(event.target.value)}>
            <option value="">Any employment type</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option>
          </select>
          <input aria-label="Posted after" type="date" value={postedAfter} onChange={(event) => setPostedAfter(event.target.value)}/>
        </>}
        <button className="secondary-button" type="submit"><SlidersHorizontal size={17}/>Search</button>
      </form>}
      {!authenticated && <div className="notice"><WifiOff size={18}/><span>Sign in to load job data from the backend.</span></div>}
      {mutationError && <div className="notice" role="alert">{mutationError}</div>}
      {authenticated && error && <div className="notice" role="alert">{error}</div>}
      {loading && <div className="card"><div className="empty-state" role="status">Loading job data…</div></div>}
      {authenticated && !loading && !error && match && matchQuery.data && (
        <div className="card">
          <div className="card-header"><h2>{job?.title ?? 'Job match'}</h2><span className="badge">{matchQuery.data.score}% match</span></div>
          <div className="card-body">
            {job && <p>{job.company} · {job.location}</p>}
            <p>{matchQuery.data.summary}</p>
            <h3>Matched requirements</h3>
            {matchQuery.data.matchedRequirements.length ? <ul>{matchQuery.data.matchedRequirements.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No matched requirements returned.</p>}
            <h3>Gaps</h3>
            {matchQuery.data.gaps.length ? <ul>{matchQuery.data.gaps.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No gaps returned.</p>}
          </div>
        </div>
      )}
      {authenticated && !loading && !error && detail && job && (
        <div className="card">
          <div className="card-header"><h2>{job.title}</h2><button className="secondary-button" type="button" disabled={busyJob === job.jobId} onClick={() => toggleSaved(job.jobId, Boolean(job.saved))}><Bookmark size={16}/>{job.saved ? 'Unsave' : 'Save job'}</button></div>
          <div className="card-body">
            <p><strong>{job.company}</strong> · {job.location}</p>
            <p>{job.workMode} {job.employmentType && `· ${job.employmentType}`}</p>
            {job.description && <p>{job.description}</p>}
            {job.requirements?.length ? <><h3>Requirements</h3><ul>{job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></> : null}
            {job.sourceUrl && <a href={job.sourceUrl} target="_blank" rel="noreferrer">View original posting</a>}
            <p><Link to={`/jobs/${encodeURIComponent(job.jobId)}/match`}>View match analysis</Link></p>
          </div>
        </div>
      )}
      {authenticated && !loading && !error && !detail && !match && (
        <div className="card">
          {!page?.items.length ? <div className="empty-state"><Search size={30}/><h3>{saved ? 'No saved jobs' : 'No jobs found'}</h3><p>A successful empty response means there are no matching records.</p></div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Role</th><th>Company</th><th>Location</th><th>Source</th><th>Actions</th></tr></thead>
              <tbody>{page.items.map((item) => <tr key={item.jobId}>
                <td><Link to={`/jobs/${encodeURIComponent(item.jobId)}`}>{item.title}</Link></td>
                <td>{item.company}</td><td>{item.location}</td><td>{item.source}</td>
                <td><button className="secondary-button" type="button" disabled={busyJob === item.jobId} onClick={() => toggleSaved(item.jobId, Boolean(item.saved ?? saved))}>{item.saved ?? saved ? 'Unsave' : 'Save'}</button></td>
              </tr>)}</tbody>
            </table></div>
          )}
        </div>
      )}
    </div>
  )
}
