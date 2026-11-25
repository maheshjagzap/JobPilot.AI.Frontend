import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { getSetupStatus, login, setupOwner, storeAuth } from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
      navigate('/agent', { replace: true })
      return
    }

    getSetupStatus()
      .then((status) => setSetupRequired(status.setupRequired))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [navigate])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const data = new FormData(event.currentTarget)

    try {
      const auth = setupRequired
        ? await setupOwner({
            email: String(data.get('email') || ''),
            password: String(data.get('password') || ''),
            firstName: String(data.get('firstName') || ''),
            lastName: String(data.get('lastName') || '') || null,
          })
        : await login(
            String(data.get('email') || ''),
            String(data.get('password') || ''),
          )

      storeAuth(auth)
      navigate('/agent', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={19} /></div><span>JobPilot <b>AI</b></span></div>
        <h1>{setupRequired ? 'Create owner account' : 'Welcome back'}</h1>
        <p className="subtitle">{setupRequired ? 'Set up the first account for this workspace.' : 'Sign in to your job-search workspace.'}</p>
        {error && <div className="notice" role="alert"><LockKeyhole size={17} /><span>{error}</span></div>}
        {setupRequired && (
          <>
            <div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" required /></div>
            <div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" /></div>
          </>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" placeholder="owner@example.com" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={setupRequired ? 'new-password' : 'current-password'} minLength={setupRequired ? 12 : undefined} required style={{ paddingRight: 42 }} />
            <button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 4, top: 4, border: 0 }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Please wait...' : setupRequired ? 'Create account' : 'Sign in'}</button>
      </form>
    </div>
  )
}
