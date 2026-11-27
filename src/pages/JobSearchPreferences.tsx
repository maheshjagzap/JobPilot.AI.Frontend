import { useState, type FormEvent } from 'react'
import {
  createJobSearchPreference,
  deleteJobSearchPreference,
  listJobSearchPreferences,
  updateJobSearchPreference,
  type JobSearchPreference,
  type UpsertJobSearchPreference,
} from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

type PreferenceForm = {
  preferenceName: string
  jobTitles: string
  locations: string
  skills: string
  employmentTypes: string
  workModes: string
  minimumSalary: string
  salaryCurrency: string
  minimumExperienceMonths: string
  maximumExperienceMonths: string
  isEnabled: boolean
  discoveryFrequency: string
}

const emptyForm: PreferenceForm = {
  preferenceName: '',
  jobTitles: '',
  locations: '',
  skills: '',
  employmentTypes: '',
  workModes: '',
  minimumSalary: '',
  salaryCurrency: '',
  minimumExperienceMonths: '',
  maximumExperienceMonths: '',
  isEnabled: true,
  discoveryFrequency: 'Daily',
}

function listValue(value: string) {
  const values = value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
  return values.length ? values : null
}

function numericValue(value: string) {
  if (!value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formFromPreference(preference: JobSearchPreference): PreferenceForm {
  return {
    preferenceName: preference.preferenceName,
    jobTitles: preference.jobTitles?.join(', ') ?? '',
    locations: preference.locations?.join(', ') ?? '',
    skills: preference.skills?.join(', ') ?? '',
    employmentTypes: preference.employmentTypes?.join(', ') ?? '',
    workModes: preference.workModes?.join(', ') ?? '',
    minimumSalary: preference.minimumSalary?.toString() ?? '',
    salaryCurrency: preference.salaryCurrency ?? '',
    minimumExperienceMonths: preference.minimumExperienceMonths?.toString() ?? '',
    maximumExperienceMonths: preference.maximumExperienceMonths?.toString() ?? '',
    isEnabled: preference.isEnabled,
    discoveryFrequency: preference.discoveryFrequency,
  }
}

function requestFromForm(form: PreferenceForm): UpsertJobSearchPreference {
  return {
    preferenceName: form.preferenceName.trim(),
    jobTitles: listValue(form.jobTitles),
    locations: listValue(form.locations),
    skills: listValue(form.skills),
    employmentTypes: listValue(form.employmentTypes),
    workModes: listValue(form.workModes),
    minimumSalary: numericValue(form.minimumSalary),
    salaryCurrency: form.salaryCurrency.trim() || null,
    minimumExperienceMonths: numericValue(form.minimumExperienceMonths),
    maximumExperienceMonths: numericValue(form.maximumExperienceMonths),
    isEnabled: form.isEnabled,
    discoveryFrequency: form.discoveryFrequency.trim() || 'Daily',
  }
}

export default function JobSearchPreferences() {
  const preferencesQuery = useApiQuery('profile-search-preferences', listJobSearchPreferences)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  function startNew() {
    setForm(emptyForm)
    setEditingId('')
    setError('')
    setStatus('')
  }

  function editPreference(preference: JobSearchPreference) {
    setForm(formFromPreference(preference))
    setEditingId(preference.preferenceId)
    setError('')
    setStatus('')
  }

  async function savePreference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStatus('')
    const request = requestFromForm(form)
    if (!request.preferenceName) {
      setError('Enter a name for this preference.')
      return
    }
    if (request.minimumSalary !== null && request.minimumSalary < 0) {
      setError('Minimum salary cannot be negative.')
      return
    }
    if (
      (request.minimumExperienceMonths !== null && request.minimumExperienceMonths < 0) ||
      (request.maximumExperienceMonths !== null && request.maximumExperienceMonths < 0)
    ) {
      setError('Experience months cannot be negative.')
      return
    }
    if (
      request.minimumExperienceMonths !== null &&
      request.maximumExperienceMonths !== null &&
      request.minimumExperienceMonths > request.maximumExperienceMonths
    ) {
      setError('Minimum experience cannot exceed maximum experience.')
      return
    }

    setBusy('save')
    try {
      if (editingId) {
        await updateJobSearchPreference(editingId, request)
      } else {
        await createJobSearchPreference(request)
      }
      const message = editingId ? 'Preference updated.' : 'Preference created.'
      setForm(emptyForm)
      setEditingId('')
      setStatus(message)
      setError('')
      preferencesQuery.refetch()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this preference.')
    } finally {
      setBusy('')
    }
  }

  async function removePreference(preference: JobSearchPreference) {
    setError('')
    setStatus('')
    setBusy(preference.preferenceId)
    try {
      await deleteJobSearchPreference(preference.preferenceId)
      if (editingId === preference.preferenceId) startNew()
      setStatus('Preference deleted.')
      preferencesQuery.refetch()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete this preference.')
    } finally {
      setBusy('')
    }
  }

  const items = preferencesQuery.data?.items ?? []
  const profileMissing = preferencesQuery.data === null

  return (
    <div className="preferences-content">
      {preferencesQuery.loading && <p role="status">Loading job-search preferences...</p>}
      {preferencesQuery.error && <div className="notice" role="alert">{preferencesQuery.error}</div>}
      {profileMissing && <div className="notice" role="status">Save your candidate profile first to create job-search preferences.</div>}
      {error && <div className="notice" role="alert">{error}</div>}
      {status && <div className="notice" role="status">{status}</div>}
      <div className="card-header">
        <h2>Job-search preferences</h2>
        <button className="secondary-button" type="button" disabled={profileMissing} onClick={startNew}>New preference</button>
      </div>
      {!preferencesQuery.loading && !preferencesQuery.error && !profileMissing && items.length === 0 && (
        <p className="profile-entry-empty">No saved job-search preferences.</p>
      )}
      {items.map((preference) => (
        <article className="profile-entry" key={preference.preferenceId}>
          <div className="profile-entry-copy">
            <strong>{preference.preferenceName}</strong>
            <span>{preference.jobTitles?.join(', ') || 'Any job title'} · {preference.locations?.join(', ') || 'Any location'}</span>
            <small>{preference.isEnabled ? 'Enabled' : 'Disabled'} · {preference.discoveryFrequency} · Next run: {preference.nextRunAt ? new Date(preference.nextRunAt).toLocaleString() : 'Not scheduled'}</small>
          </div>
          <div className="header-actions">
            <button className="secondary-button" type="button" disabled={busy !== ''} onClick={() => editPreference(preference)}>Edit</button>
            <button className="secondary-button" type="button" disabled={busy !== ''} onClick={() => { void removePreference(preference) }}>Delete</button>
          </div>
        </article>
      ))}
      <form className="form-grid" onSubmit={(event) => { void savePreference(event) }}>
        <h3 className="full">{editingId ? 'Edit preference' : 'Create preference'}</h3>
        <div className="field full">
          <label htmlFor="preference-name">Preference name *</label>
          <input id="preference-name" required value={form.preferenceName} onChange={(event) => setForm((current) => ({ ...current, preferenceName: event.target.value }))}/>
        </div>
        {([
          ['jobTitles', 'Job titles'],
          ['locations', 'Locations'],
          ['skills', 'Skills'],
          ['employmentTypes', 'Employment types'],
          ['workModes', 'Work modes'],
        ] as const).map(([field, label]) => (
          <div className="field" key={field}>
            <label htmlFor={`preference-${field}`}>{label} (comma-separated)</label>
            <input id={`preference-${field}`} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}/>
          </div>
        ))}
        <div className="field">
          <label htmlFor="preference-minimum-salary">Minimum salary</label>
          <input id="preference-minimum-salary" type="number" min="0" step="0.01" value={form.minimumSalary} onChange={(event) => setForm((current) => ({ ...current, minimumSalary: event.target.value }))}/>
        </div>
        <div className="field">
          <label htmlFor="preference-currency">Salary currency</label>
          <input id="preference-currency" value={form.salaryCurrency} onChange={(event) => setForm((current) => ({ ...current, salaryCurrency: event.target.value }))} placeholder="USD"/>
        </div>
        <div className="field">
          <label htmlFor="preference-minimum-experience">Minimum experience (months)</label>
          <input id="preference-minimum-experience" type="number" min="0" step="1" value={form.minimumExperienceMonths} onChange={(event) => setForm((current) => ({ ...current, minimumExperienceMonths: event.target.value }))}/>
        </div>
        <div className="field">
          <label htmlFor="preference-maximum-experience">Maximum experience (months)</label>
          <input id="preference-maximum-experience" type="number" min="0" step="1" value={form.maximumExperienceMonths} onChange={(event) => setForm((current) => ({ ...current, maximumExperienceMonths: event.target.value }))}/>
        </div>
        <div className="field">
          <label htmlFor="preference-frequency">Discovery frequency</label>
          <input id="preference-frequency" value={form.discoveryFrequency} onChange={(event) => setForm((current) => ({ ...current, discoveryFrequency: event.target.value }))}/>
        </div>
        <label className="work-mode-option full">
          <input type="checkbox" checked={form.isEnabled} onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.checked }))}/>
          <span>Preference enabled</span>
        </label>
        <div className="header-actions full">
          <button className="primary-button" type="submit" disabled={busy !== '' || profileMissing}>{busy === 'save' ? 'Saving...' : editingId ? 'Update preference' : 'Create preference'}</button>
          {editingId && <button className="secondary-button" type="button" disabled={busy !== ''} onClick={startNew}>Cancel edit</button>}
        </div>
      </form>
    </div>
  )
}
