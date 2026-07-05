import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/incidents')
      .then(res => setIncidents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const open = incidents.filter(i => i.status !== 'published').length
  const review = incidents.filter(i => i.status === 'review').length
  const p1p2 = incidents.filter(i => i.severity === 'P1' || i.severity === 'P2').length
  const published = incidents.filter(i => i.status === 'published').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 h-12 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium">Dashboard</span>
        <button
          onClick={() => navigate('/incidents/new')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
        >
          + New incident
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Open incidents', value: open, sub: `${review} in review` },
            { label: 'Total incidents', value: incidents.length, sub: 'all time' },
            { label: 'P1 / P2', value: p1p2, sub: 'all time' },
            { label: 'Published', value: published, sub: 'postmortems' },
          ].map(m => (
            <div key={m.label} className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className="text-2xl font-medium">{m.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">
          Recent incidents
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && incidents.length === 0 && (
          <p className="text-sm text-gray-500">No incidents yet.</p>
        )}

        <div className="flex flex-col gap-1.5">
          {incidents.map(incident => (
            <div
              key={incident.id}
              onClick={() => navigate(`/incidents/${incident.id}`)}
              className="flex items-center gap-3 px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors"
            >
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${SEVERITY_STYLES[incident.severity]}`}>
                {incident.severity}
              </span>
              <span className="text-sm flex-1 truncate">{incident.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[incident.status]}`}>
                {incident.status}
              </span>
              <span className="text-xs text-gray-600">{timeAgo(incident.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}