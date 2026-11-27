import { useState } from 'react'
import { Activity as ActivityIcon } from 'lucide-react'
import { readStoredAuth } from '../api/auth'
import { listActivity } from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

const categories = ['All', 'applications']

export default function Activity() {
  const [category, setCategory] = useState('All')
  const authenticated = Boolean(readStoredAuth())
  const activityQuery = useApiQuery(
    `activity:${category}`,
    () => listActivity({ category: category === 'All' ? undefined : category, pageSize: 20 }),
    authenticated,
  )

  return (
    <div>
      <div className="page-header"><div><h1>Activity Centre</h1><p>Important product and automation events</p></div></div>
      {!authenticated && <div className="notice" role="alert">Sign in to load activity.</div>}
      {activityQuery.error && <div className="notice" role="alert">{activityQuery.error}</div>}
      <div className="tabs" role="tablist" aria-label="Activity category">
        {categories.map((item) => <button
          className={`tab ${category === item ? 'active' : ''}`}
          aria-selected={category === item}
          key={item}
          role="tab"
          type="button"
          onClick={() => setCategory(item)}
        >{item}</button>)}
      </div>
      <div className="card">
        {activityQuery.loading
          ? <div className="empty-state" role="status">Loading activity...</div>
          : activityQuery.data?.items.length
            ? <div className="card-body">{activityQuery.data.items.map((event) => (
              <article className="profile-entry" key={event.eventId}>
                <ActivityIcon size={18}/>
                <div className="profile-entry-copy"><strong>{event.summary}</strong><span>{event.category} · {event.type}</span><small>{new Date(event.occurredAt).toLocaleString()}</small></div>
              </article>
            ))}</div>
            : authenticated && !activityQuery.error && <div className="empty-state"><ActivityIcon size={30}/><h3>No verified activity</h3><p>A successful empty response means there is no activity for this filter.</p></div>}
      </div>
    </div>
  )
}
