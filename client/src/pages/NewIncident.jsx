import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const SEVERITIES = ['P1', 'P2', 'P3', 'P4']

export default function NewIncident() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    severity: 'P2',
    summary: '',
    started_at: '',
    detected_at: '',
    resolved_at: '',
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.title || !form.severity || !form.started_at) {
      setError('Title, severity, and start time are required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        severity: form.severity,
        summary: form.summary || null,
        started_at: new Date(form.started_at).toISOString(),
        detected_at: form.detected_at ? new Date(form.detected_at).toISOString() : null,
        resolved_at: form.resolved_at ? new Date(form.resolved_at).toISOString() : null,
      }
      const res = await api.post('/api/incidents', payload)
      navigate(`/incidents/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 h-12 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-400 text-xs">← Back</button>
          <span className="text-sm font-medium">New incident</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create incident'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 max-w-2xl">
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="What happened?"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5">Severity</label>
          <div className="flex gap-2">
            {SEVERITIES.map(s => (
              <button
                key={s}
                onClick={() => set('severity', s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.severity === s
                    ? 'bg-violet-700 border-violet-600 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5">Summary</label>
          <textarea
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            placeholder="Brief description of what happened and the impact"
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Started at</label>
            <input
              type="datetime-local"
              value={form.started_at}
              onChange={e => set('started_at', e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Detected at</label>
            <input
              type="datetime-local"
              value={form.detected_at}
              onChange={e => set('detected_at', e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Resolved at</label>
            <input
              type="datetime-local"
              value={form.resolved_at}
              onChange={e => set('resolved_at', e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}