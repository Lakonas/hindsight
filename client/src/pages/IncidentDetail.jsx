import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

const SEVERITY_STYLES = {
  P1: 'bg-red-950 text-red-400',
  P2: 'bg-amber-950 text-amber-400',
  P3: 'bg-blue-950 text-blue-400',
  P4: 'bg-green-950 text-green-400',
}

const STATUS_STYLES = {
  draft: 'bg-gray-800 text-gray-400',
  review: 'bg-amber-950 text-amber-400',
  published: 'bg-green-950 text-green-400',
}

const TIMELINE_DOT = {
  detection: 'bg-red-500',
  action: 'bg-violet-500',
  escalation: 'bg-amber-500',
  resolution: 'bg-green-500',
  other: 'bg-gray-500',
}

const FACTOR_STYLES = {
  technology: 'bg-blue-950 text-blue-400',
  process: 'bg-violet-950 text-violet-400',
  people: 'bg-amber-950 text-amber-400',
  environment: 'bg-green-950 text-green-400',
}

const ACTION_STYLES = {
  open: 'bg-gray-800 text-gray-400',
  in_progress: 'bg-amber-950 text-amber-400',
  done: 'bg-green-950 text-green-400',
}

const TABS = ['overview', 'timeline', 'factors', 'actions']

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [incident, setIncident] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [factors, setFactors] = useState([])
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/api/incidents/${id}`),
      api.get(`/api/incidents/${id}/timeline`),
      api.get(`/api/incidents/${id}/factors`),
      api.get(`/api/incidents/${id}/actions`),
    ]).then(([inc, tl, fac, act]) => {
      setIncident(inc.data)
      setTimeline(tl.data)
      setFactors(fac.data)
      setActions(act.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-5 text-sm text-gray-500">Loading...</div>
  if (!incident) return <div className="p-5 text-sm text-gray-500">Incident not found.</div>

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 h-12 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-400 text-xs">← Back</button>
          <span className="text-sm font-medium truncate">{incident.title}</span>
        </div>
        <button
          onClick={() => navigate(`/incidents/${id}/postmortem`)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
        >
          View postmortem
        </button>
      </div>

      <div className="flex gap-2 px-5 border-b border-gray-800 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2.5 px-1 text-sm border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-violet-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'factors' ? 'Contributing factors' : t === 'actions' ? 'Action items' : t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">

        {tab === 'overview' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${SEVERITY_STYLES[incident.severity]}`}>
                {incident.severity}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[incident.status]}`}>
                {incident.status}
              </span>
              <span className="text-xs text-gray-600">
                Started {new Date(incident.started_at).toLocaleString()}
                {incident.resolved_at && ` · Resolved ${new Date(incident.resolved_at).toLocaleString()}`}
              </span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Summary</div>
              <p className="text-sm text-gray-300 leading-relaxed">{incident.summary || 'No summary provided.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Detection</div>
                <p className="text-sm text-gray-300">{incident.detected_at ? new Date(incident.detected_at).toLocaleString() : '—'}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Resolution</div>
                <p className="text-sm text-gray-300">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'Ongoing'}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-4">Timeline</div>
            {timeline.length === 0 && <p className="text-sm text-gray-500">No timeline events yet.</p>}
            {timeline.map(event => (
              <div key={event.id} className="flex gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TIMELINE_DOT[event.event_type]}`} />
                <div>
                  <div className="text-xs text-gray-600">{new Date(event.occurred_at).toLocaleTimeString()}</div>
                  <div className="text-sm text-gray-300">{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'factors' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-4">Contributing factors</div>
            {factors.length === 0 && <p className="text-sm text-gray-500">No contributing factors yet.</p>}
            {factors.map(factor => (
              <div key={factor.id} className="flex gap-3 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded h-fit ${FACTOR_STYLES[factor.category]}`}>
                  {factor.category}
                </span>
                <span className="text-sm text-gray-300">{factor.description}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'actions' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-4">Action items</div>
            {actions.length === 0 && <p className="text-sm text-gray-500">No action items yet.</p>}
            {actions.map(action => (
              <div key={action.id} className="flex items-center gap-3 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded ${ACTION_STYLES[action.status]}`}>
                  {action.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-300 flex-1">{action.title}</span>
                {action.owner && <span className="text-xs text-gray-600">@{action.owner}</span>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}