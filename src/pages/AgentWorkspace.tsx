import { useRef, useState } from 'react'
import { AlertCircle, ArrowUp, BriefcaseBusiness, FileText, MapPin, UserRound, WandSparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const suggestions = [
  'Find the latest .NET developer jobs posted today',
  'Find remote backend roles that match my profile',
  'Show my recent application updates',
]

export default function AgentWorkspace() {
  const location = useLocation()
  const [command, setCommand] = useState(() =>
    typeof location.state?.initialCommand === 'string' ? location.state.initialCommand : '',
  )
  const [unavailable, setUnavailable] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function submitCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!command.trim()) return
    setUnavailable(true)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className="agent-workspace">
      <section className="agent-welcome">
        <div className="agent-orb"><WandSparkles size={24} /></div>
        <span className="eyebrow">YOUR JOB SEARCH ASSISTANT</span>
        <h1>What would you like me to do?</h1>
        <p>Tell JobPilot what you’re looking for. Your profile and saved documents can provide context once connected.</p>
        <div className="context-panel" aria-label="Available candidate context">
          <div className="context-title">Candidate context <span>Not connected</span></div>
          <div className="context-items">
            <div><UserRound size={16}/><span>Profile</span><b>Unavailable</b></div>
            <div><FileText size={16}/><span>Resume</span><b>Unavailable</b></div>
            <div><BriefcaseBusiness size={16}/><span>Preferences</span><b>Unavailable</b></div>
            <div><MapPin size={16}/><span>Location & work authorization</span><b>Unavailable</b></div>
          </div>
        </div>
      </section>

      <section className="command-section" aria-label="Agent command">
        <form className="command-composer" ref={formRef} onSubmit={submitCommand}>
          <label className="sr-only" htmlFor="agent-command">Tell JobPilot what you want to do</label>
          <textarea
            id="agent-command"
            ref={textareaRef}
            value={command}
            onChange={(event) => { setCommand(event.target.value); setUnavailable(false) }}
            onKeyDown={handleKeyDown}
            placeholder="Tell JobPilot what you want to do..."
            rows={3}
          />
          <div className="composer-footer">
            <span>Enter to run · Shift + Enter for a new line</span>
            <button className="primary-button run-command" type="submit" disabled={!command.trim()}>
              Run task <ArrowUp size={17}/>
            </button>
          </div>
        </form>
        {unavailable && (
          <div className="agent-unavailable" role="alert">
            <AlertCircle size={18}/>
            <div><strong>Task not sent</strong><span>The agent backend is not connected. Your request remains here and no search or application action was performed.</span></div>
          </div>
        )}
      </section>

      <section className="suggestions-section">
        <h2>Try asking</h2>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <button className="suggestion-chip" key={suggestion} onClick={() => {
              setCommand(suggestion)
              setUnavailable(false)
              textareaRef.current?.focus()
            }} type="button">{suggestion}</button>
          ))}
        </div>
      </section>

      <div className="agent-trust-note"><WandSparkles size={16}/><span>No agent activity is simulated. When connected, task progress and results will appear here.</span></div>
    </div>
  )
}
