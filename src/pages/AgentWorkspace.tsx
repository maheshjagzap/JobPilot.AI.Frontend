import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowUp, BriefcaseBusiness, FileText, MapPin, UserRound, WandSparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { readStoredAuth } from '../api/auth'
import { createAgentTask, getAgentCapabilities, getAgentTask, listAgentTasks, sendAgentMessage } from '../api/features'
import { useApiQuery } from '../api/useApiQuery'

const suggestions = [
  'Find the latest .NET developer jobs posted today',
  'Find remote backend roles that match my profile',
  'Show my recent application updates',
]

function isTerminal(status?: string) {
  return status === 'completed' || status === 'failed' || status === 'cancelled'
}

function displayResult(result: unknown) {
  if (typeof result === 'string') return result
  try {
    return JSON.stringify(result)
  } catch {
    return 'Result could not be displayed.'
  }
}

export default function AgentWorkspace() {
  const location = useLocation()
  const [command, setCommand] = useState(() =>
    typeof location.state?.initialCommand === 'string' ? location.state.initialCommand : '',
  )
  const [taskId, setTaskId] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const authenticated = Boolean(readStoredAuth())
  const capabilitiesQuery = useApiQuery('agent-capabilities', getAgentCapabilities, authenticated)
  const historyQuery = useApiQuery('agent-task-history', () => listAgentTasks({ limit: 20 }), authenticated)
  const taskQuery = useApiQuery(`agent-task:${taskId}`, () => getAgentTask(taskId), authenticated && Boolean(taskId))
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const task = taskQuery.data
  const taskStatus = task?.status
  const canContinue = Boolean(conversationId) && task?.status === 'waiting_for_user'

  useEffect(() => {
    if (!taskId || !taskStatus || isTerminal(taskStatus)) return
    const timer = window.setInterval(taskQuery.refetch, 3000)
    return () => window.clearInterval(timer)
  }, [taskId, taskStatus, taskQuery.refetch])

  async function submitCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!command.trim()) return
    if (!authenticated) {
      setUnavailable(true)
      return
    }
    if (!capabilitiesQuery.data?.available) {
      setError(capabilitiesQuery.error || 'The agent service is unavailable and did not receive your request.')
      return
    }
    setPending(true)
    setError('')
    setUnavailable(false)
    try {
      const response = canContinue
        ? await sendAgentMessage(conversationId, command.trim())
        : await createAgentTask(command.trim())
      setTaskId(response.taskId)
      setConversationId(response.conversationId)
      setCommand('')
      historyQuery.refetch()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The task could not be submitted.')
    } finally {
      setPending(false)
    }
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
          <div className="context-title">Candidate context <span>{authenticated ? 'Connected account' : 'Not connected'}</span></div>
          <div className="context-items">
            <div><UserRound size={16}/><span>Profile</span><b>{authenticated ? 'Available to service' : 'Unavailable'}</b></div>
            <div><FileText size={16}/><span>Resume</span><b>{authenticated ? 'Available to service' : 'Unavailable'}</b></div>
            <div><BriefcaseBusiness size={16}/><span>Preferences</span><b>{authenticated ? 'Available to service' : 'Unavailable'}</b></div>
            <div><MapPin size={16}/><span>Location & work authorization</span><b>{authenticated ? 'Available to service' : 'Unavailable'}</b></div>
          </div>
        </div>
      </section>

      <section className="command-section" aria-label="Agent command">
        <form className="command-composer" ref={formRef} onSubmit={(event) => { void submitCommand(event) }}>
          <label className="sr-only" htmlFor="agent-command">Tell JobPilot what you want to do</label>
          <textarea
            id="agent-command"
            ref={textareaRef}
            value={command}
            onChange={(event) => { setCommand(event.target.value); setUnavailable(false) }}
            onKeyDown={handleKeyDown}
            placeholder={canContinue ? 'Answer the agent or ask a follow-up...' : 'Tell JobPilot what you want to do...'}
            rows={3}
          />
          <div className="composer-footer">
            <span>Enter to run · Shift + Enter for a new line</span>
            <button className="primary-button run-command" type="submit" disabled={!command.trim() || pending}>
              {pending ? 'Sending...' : canContinue ? 'Reply' : 'Run task'} <ArrowUp size={17}/>
            </button>
          </div>
        </form>
        {!authenticated && unavailable && (
          <div className="agent-unavailable" role="alert">
            <AlertCircle size={18}/>
            <div><strong>Task not sent</strong><span>The agent backend is not connected. Your request remains here and no search or application action was performed. Sign in to send it to the agent API.</span></div>
          </div>
        )}
        {error && <div className="agent-unavailable" role="alert"><AlertCircle size={18}/><div><strong>Request failed</strong><span>{error}</span></div></div>}
        {authenticated && capabilitiesQuery.error && <div className="agent-unavailable" role="alert"><AlertCircle size={18}/><div><strong>Agent unavailable</strong><span>{capabilitiesQuery.error}</span></div></div>}
        {taskQuery.error && <div className="agent-unavailable" role="alert"><AlertCircle size={18}/><div><strong>Task status unavailable</strong><span>{taskQuery.error}</span></div></div>}
        {task && <div className="card">
          <div className="card-header"><h2>Task status: {task.status}</h2><span>{task.currentStep}</span></div>
          <div className="card-body">
            {task.message && <p>{task.message}</p>}
            {task.results?.map((result, index) => <p key={`${task.taskId}-${index}`}>{displayResult(result)}</p>)}
          </div>
        </div>}
      </section>

      {authenticated && <section className="suggestions-section">
        <h2>Recent tasks</h2>
        {historyQuery.error && <div className="notice" role="alert">{historyQuery.error}</div>}
        {historyQuery.data?.items.map((recentTask) => (
          <button className="suggestion-chip" key={recentTask.taskId} type="button" onClick={() => {
            setTaskId(recentTask.taskId)
            setConversationId(recentTask.conversationId)
            setError('')
          }}>{recentTask.title || recentTask.taskId} · {recentTask.status}</button>
        ))}
        {!historyQuery.loading && !historyQuery.error && !historyQuery.data?.items.length && <p>No prior tasks.</p>}
      </section>}

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

      <div className="agent-trust-note"><WandSparkles size={16}/><span>Task status and results come from the agent service. Submission of an application still requires explicit approval in the review page.</span></div>
    </div>
  )
}
