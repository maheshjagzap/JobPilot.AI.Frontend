import { useState } from 'react'
import { BriefcaseBusiness, Link2, LogOut, Mail, Monitor, Moon, Plus, Sun } from 'lucide-react'
import { logout } from '../api/auth'

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
  const [theme, setTheme] = useState(localStorage.getItem('jobpilot-theme') || 'light')
  const [initialRequest] = useState(readConnectionRequest)
  const [selectedProviders, setSelectedProviders] = useState(initialRequest.value.providers)
  const [otherProvider, setOtherProvider] = useState(initialRequest.value.otherProvider)
  const [connectionStatus, setConnectionStatus] = useState(initialRequest.status)

  function chooseTheme(value: string) {
    const nextTheme = value === 'dark' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem('jobpilot-theme', nextTheme)
  }

  function toggleProvider(provider: string) {
    setSelectedProviders((selected) => selected.includes(provider)
      ? selected.filter((item) => item !== provider)
      : [...selected, provider])
    setConnectionStatus('Unsaved connection preferences.')
  }

  function saveConnectionRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const request = {
      providers: selectedProviders,
      otherProvider: selectedProviders.includes('Other') ? otherProvider.trim() : '',
    }
    try {
      localStorage.setItem('jobpilot-connection-request', JSON.stringify(request))
      setConnectionStatus('Request saved in this browser. No accounts were connected.')
    } catch {
      setConnectionStatus('Could not save your request in browser storage.')
    }
  }

  return (
    <div>
      <div className="page-header"><div><h1>Settings</h1><p>Workspace preferences and account connections</p></div></div>
      <div className="settings-stack">
        <div className="card">
          <div className="card-header"><h2>Appearance</h2></div>
          <div className="card-body settings-theme-options">
            <button className={`secondary-button ${theme === 'light' ? 'active' : ''}`} onClick={() => chooseTheme('light')}><Sun size={17}/>Light</button>
            <button className={`secondary-button ${theme === 'dark' ? 'active' : ''}`} onClick={() => chooseTheme('dark')}><Moon size={17}/>Dark</button>
            <button className="secondary-button" onClick={() => chooseTheme('light')}><Monitor size={17}/>System</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Connect your accounts</h2><span className="badge warning">Not connected</span></div>
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
                      <span className="badge warning">Not linked</span>
                    </label>
                  )
                })}
                <label className={`integration-provider ${selectedProviders.includes('Other') ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selectedProviders.includes('Other')} onChange={() => toggleProvider('Other')}/>
                  <span className="integration-icon"><Plus size={18}/></span>
                  <span className="integration-copy"><strong>Other provider</strong><small>Add another job board or service</small></span>
                  <span className="badge warning">Not linked</span>
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
          <div className="card-header"><h2>Security</h2></div>
          <div className="card-body"><button className="danger-button" onClick={async () => { try { await logout() } catch { /* logout helper clears memory in all cases */ } window.location.assign('/login') }}><LogOut size={17}/> Log out</button></div>
        </div>
      </div>
    </div>
  )
}
