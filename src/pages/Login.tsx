import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, Eye, EyeOff, LockKeyhole } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
      sessionStorage.setItem('jobpilot-auth', 'true')
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    if (!data.get('email') || !data.get('password')) {
      setError('Enter both your email and password.')
      return
    }
    setError('Login is unavailable until the backend authentication endpoint is connected.')
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={19} /></div><span>JobPilot <b>AI</b></span></div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your job-search workspace.</p>
        {error && <div className="notice" role="alert"><LockKeyhole size={17} /><span>{error}</span></div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" placeholder="owner@example.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" style={{ paddingRight: 42 }} />
            <button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 4, top: 4, border: 0 }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button className="primary-button" type="submit">Sign in</button>
        <button type="button" className="secondary-button" onClick={() => { sessionStorage.setItem('jobpilot-auth', 'true'); navigate('/dashboard') }} style={{ width: '100%', marginTop: 8 }}>Preview workspace</button>
      </form>
    </div>
  )
}
