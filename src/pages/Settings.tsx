import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Link2, LogOut, Mail, Monitor, Moon, Plus, Sun } from 'lucide-react'
import { logout, readStoredAuth } from '../api/auth'
import {
  getIntegrations,
  getNotificationPreferences,
  getSettings,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveConnectionRequest as saveConnectionRequestApi,
  updateNotificationPreferences,
  updateSettings,
  type NotificationPreferences,
} from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

const providers = [
  { name: 'Naukri', detail: 'Job search and application activity', icon: BriefcaseBusiness },
  { name: 'Gmail', detail: 'Email-based application updates', icon: Mail },
  { name: 'LinkedIn', detail: 'Job applications and saved roles', icon: Link2 },
  { name: 'Indeed', detail: 'Job applications and saved roles', icon: BriefcaseBusiness },
]

type ConnectionRequest = {
  providers: string[]
  otherProvider: string
}

function readConnectionRequest(): { value: ConnectionRequest; status: string } {
  try {
    const raw = localStorage.getItem('jobpilot-connection-request')
    if (!raw) return { value: { providers: [], otherProvider: '' }, status: 'No connection preferences saved.' }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'providers' in parsed &&
      Array.isArray(parsed.providers) &&
      parsed.providers.every((provider) => typeof provider === 'string') &&
      'otherProvider' in parsed &&
      typeof parsed.otherProvider === 'string'
    ) {
      return {
        value: { providers: parsed.providers, otherProvider: parsed.otherProvider },
        status: 'Connection preferences loaded from this browser. No accounts are linked.',
      }
    }
    return { value: { providers: [], otherProvider: '' }, status: 'Saved connection preferences could not be read.' }
  } catch {
    return { value: { providers: [], otherProvider: '' }, status: 'Browser storage is unavailable.' }
  }
}

export default function Settings() {
  const authenticated = Boolean(readStoredAuth())
  const appearanceQuery = useApiQuery('settings-appearance', getSettings, authenticated)
  const integrationsQuery = useApiQuery('settings-integrations', getIntegrations, authenticated)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const notificationsQuery = useApiQuery(`notifications:${unreadOnly}`, () => listNotifications({ unreadOnly, pageSize: 20 }), authenticated)
  const preferencesQuery = useApiQuery('notification-preferences', getNotificationPreferences, authenticated)
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | 'system'>()
  const localTheme = localStorage.getItem('jobpilot-theme') === 'dark'
    ? 'dark'
    : localStorage.getItem('jobpilot-theme') === 'system' ? 'system' : 'light'
  const theme = themeOverride ?? appearanceQuery.data?.theme ?? localTheme
  const [initialRequest] = useState(readConnectionRequest)
  const [selectedProviders, setSelectedProviders] = useState(initialRequest.value.providers)
  const [otherProvider, setOtherProvider] = useState(initialRequest.value.otherProvider)
  const [connectionStatus, setConnectionStatus] = useState(initialRequest.status)
  const [requestError, setRequestError] = useState('')
  const [themeStatus, setThemeStatus] = useState('')
  const [notificationPreferencesDraft, setNotificationPreferencesDraft] = useState<NotificationPreferences>()
  const notificationPreferences = notificationPreferencesDraft ?? preferencesQuery.data ?? {
    inAppEnabled: true,
    categories: { applications: true, automation: true, jobs: true, account: true },
  }

  useEffect(() => {
    if (appearanceQuery.data && !themeOverride) applyTheme(appearanceQuery.data.theme)
  }, [appearanceQuery.data, themeOverride])

  async function chooseTheme(value: 'light' | 'dark' | 'system') {
    setRequestError('')
    setThemeStatus('')
    if (!authenticated) {
      setThemeOverride(value)
      applyTheme(value)
      return
    }
    try {
      const saved = await updateSettings(value)
      setThemeOverride(saved.theme)
      applyTheme(saved.theme)
      setThemeStatus('Appearance saved to your account.')
    } catch (reason) {
      setRequestError(reason instanceof Error ? reason.message : 'Could not save appearance settings.')
    }
  }

  function applyTheme(value: 'light' | 'dark' | 'system') {
    const effectiveTheme = value === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : value
    document.documentElement.dataset.theme = effectiveTheme
    localStorage.setItem('jobpilot-theme', value)
    window.dispatchEvent(new CustomEvent('jobpilot-theme-change', { detail: value }))
  }

  function toggleProvider(provider: string) {
    setSelectedProviders((selected) => selected.includes(provider)
      ? selected.filter((item) => item !== provider)
      : [...selected, provider])
    setConnectionStatus('Unsaved connection preferences.')
  }

  async function saveConnectionRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const request = {
      providers: selectedProviders,
      otherProvider: selectedProviders.includes('Other') ? otherProvider.trim() : '',
    }
    setRequestError('')
    if (authenticated) {
      try {
        await saveConnectionRequestApi(request)
        setConnectionStatus('Connection request saved to your account. No accounts were connected.')
        integrationsQuery.refetch()
      } catch (reason) {
        setRequestError(reason instanceof Error ? reason.message : 'Could not save the connection request.')
      }
      return
    }
    try {
      localStorage.setItem('jobpilot-connection-request', JSON.stringify(request))
      setConnectionStatus('Request saved in this browser. No accounts were connected.')
    } catch {
      setConnectionStatus('Could not save your request in browser storage.')
    }
  }

  async function saveNotifications(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestError('')
    try {
      const saved = await updateNotificationPreferences({
        inAppEnabled: notificationPreferences.inAppEnabled,
        categories: notificationPreferences.categories,
      })
      setNotificationPreferencesDraft(saved)
      setThemeStatus('Notification preferences saved.')
      preferencesQuery.refetch()
    } catch (reason) {
      setRequestError(reason instanceof Error ? reason.message : 'Could not save notification preferences.')
    }
  }

  async function markAllRead() {
    setRequestError('')
    try {
      await markAllNotificationsRead()
      notificationsQuery.refetch()
    } catch (reason) {
      setRequestError(reason instanceof Error ? reason.message : 'Could not mark notifications as read.')
    }
  }

  async function markRead(notificationId: string) {
    setRequestError('')
    try {
      await markNotificationRead(notificationId)
      notificationsQuery.refetch()
    } catch (reason) {
      setRequestError(reason instanceof Error ? reason.message : 'Could not mark notification as read.')
    }
  }

  return (
    <div>
      <div className="page-header"><div><h1>Settings</h1><p>Workspace preferences and account connections</p></div></div>
      {requestError && <div className="notice" role="alert">{requestError}</div>}
      {authenticated && appearanceQuery.error && <div className="notice" role="alert">{appearanceQuery.error}</div>}
      {authenticated && integrationsQuery.error && <div className="notice" role="alert">{integrationsQuery.error}</div>}
      {authenticated && notificationsQuery.error && <div className="notice" role="alert">{notificationsQuery.error}</div>}
      {authenticated && preferencesQuery.error && <div className="notice" role="alert">{preferencesQuery.error}</div>}
      {themeStatus && <div className="notice" role="status">{themeStatus}</div>}
      <div className="settings-stack">
        <div className="card">
          <div className="card-header"><h2>Appearance</h2></div>
          <div className="card-body settings-theme-options">
            <button className={`secondary-button ${theme === 'light' ? 'active' : ''}`} onClick={() => { void chooseTheme('light') }}><Sun size={17}/>Light</button>
            <button className={`secondary-button ${theme === 'dark' ? 'active' : ''}`} onClick={() => { void chooseTheme('dark') }}><Moon size={17}/>Dark</button>
            <button className={`secondary-button ${theme === 'system' ? 'active' : ''}`} onClick={() => { void chooseTheme('system') }}><Monitor size={17}/>System</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Connect your accounts</h2><span className="badge warning">{integrationsQuery.loading && authenticated ? 'Loading' : 'Connection status'}</span></div>
          <div className="card-body">
            <div className="notice"><Link2 size={18}/><span>Which accounts would you like to link? Choose any that you want to connect when secure authorization becomes available. This saves your request only; it does not connect an account.</span></div>
            <form onSubmit={saveConnectionRequest}>
              <div className="integration-provider-list">
                {providers.map((provider) => {
                  const Icon = provider.icon
                  const checked = selectedProviders.includes(provider.name)
                  return (
                    <label className={`integration-provider ${checked ? 'selected' : ''}`} key={provider.name}>
                      <input type="checkbox" checked={checked} onChange={() => toggleProvider(provider.name)}/>
                      <span className="integration-icon"><Icon size={18}/></span>
                      <span className="integration-copy"><strong>{provider.name}</strong><small>{provider.detail}</small></span>
                      <span className={`badge ${integrationsQuery.data?.integrations.find((item) => item.provider.toLowerCase() === provider.name.toLowerCase())?.status === 'connected' ? '' : 'warning'}`}>
                        {integrationsQuery.data?.integrations.find((item) => item.provider.toLowerCase() === provider.name.toLowerCase())?.status ?? (authenticated ? 'Unavailable' : 'Not linked')}
                      </span>
                    </label>
                  )
                })}
                <label className={`integration-provider ${selectedProviders.includes('Other') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selectedProviders.includes('Other')} onChange={() => toggleProvider('Other')}/>
                  <span className="integration-icon"><Plus size={18}/></span>
                  <span className="integration-copy"><strong>Other provider</strong><small>Add another job board or service</small></span>
                  <span className="badge warning">{authenticated ? 'Unavailable' : 'Not linked'}</span>
                </label>
                {selectedProviders.includes('Other') && <div className="field integration-other-field">
                  <label htmlFor="other-provider">Provider name</label>
                  <input id="other-provider" value={otherProvider} onChange={(event) => { setOtherProvider(event.target.value); setConnectionStatus('Unsaved connection preferences.') }} placeholder="Enter provider name"/>
                </div>}
              </div>
              <div className="integration-save-row">
                <span role="status">{connectionStatus}</span>
                <button className="primary-button" type="submit">Save connection request</button>
              </div>
            </form>
            <p className="integration-safety-note">Never enter your account password here. Real account linking must use a secure provider authorization flow. Gmail permissions will require a separate, explicit consent step.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Notifications</h2><span className="badge">{notificationsQuery.data?.unreadCount ?? 0} unread</span></div>
          <div className="card-body">
            <label><input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)}/> Unread only</label>
            {!authenticated ? <p>Sign in to load notifications.</p> : notificationsQuery.loading
              ? <p role="status">Loading notifications...</p>
              : notificationsQuery.data?.items.length
                ? <>
                  <div className="header-actions"><button className="secondary-button" type="button" disabled={!notificationsQuery.data.unreadCount} onClick={() => { void markAllRead() }}>Mark all read</button></div>
                  <ul>{notificationsQuery.data.items.map((notification) => (
                    <li key={notification.notificationId}>
                      <strong>{notification.title}</strong> — {notification.message}
                      {!notification.readAt && <button className="secondary-button" type="button" onClick={() => { void markRead(notification.notificationId) }}>Mark read</button>}
                    </li>
                  ))}</ul>
                </>
                : <p>No notifications.</p>}
            <form onSubmit={saveNotifications}>
              <label><input type="checkbox" checked={notificationPreferences.inAppEnabled} onChange={(event) => setNotificationPreferencesDraft((current) => ({ ...(current ?? notificationPreferences), inAppEnabled: event.target.checked }))}/> Enable in-app notifications</label>
              {Object.entries(notificationPreferences.categories).map(([category, enabled]) => (
                <label key={category} style={{ display: 'block' }}>
                  <input type="checkbox" checked={enabled} onChange={(event) => setNotificationPreferencesDraft((current) => ({ ...(current ?? notificationPreferences), categories: { ...notificationPreferences.categories, [category]: event.target.checked } }))}/>
                  {category}
                </label>
              ))}
              <button className="primary-button" type="submit" disabled={!authenticated || preferencesQuery.loading}>Save notification preferences</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Security</h2></div>
          <div className="card-body"><button className="danger-button" onClick={async () => { try { await logout() } catch { /* logout helper clears memory in all cases */ } window.location.assign('/login') }}><LogOut size={17}/> Log out</button></div>
        </div>
      </div>
    </div>
  )
}
