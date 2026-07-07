import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Postmortem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [postmortem, setPostmortem] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/incidents/${id}`)
      .then(res => setIncident(res.data))
      .catch(console.error)

    api.get(`/api/postmortems/${id}`)
      .then(res => setPostmortem(res.data))
      .catch(() => setPostmortem(null))
      .finally(() => setLoading(false))
  }, [id])

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await api.post(`/api/postmortems/${id}/generate`)
      setPostmortem(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 h-12 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/incidents/${id}`)}
            className="text-gray-600 hover:text-gray-400 text-xs"
          >
            ← Back
          </button>
          <span className="text-sm font-medium">
            Postmortem {incident ? `— ${incident.title}` : ''}
          </span>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating...' : postmortem ? 'Regenerate with AI' : 'Generate with AI'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && !postmortem && !generating && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-sm text-gray-500">No postmortem generated yet.</p>
            <button
              onClick={generate}
              className="text-xs px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
            >
              Generate with AI
            </button>
          </div>
        )}

        {generating && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Generating postmortem...</p>
          </div>
        )}

        {postmortem && !generating && (
          <div>
            <div className="text-xs text-gray-600 mb-4">
              Generated {new Date(postmortem.generated_at).toLocaleString()}
              {postmortem.published_at && ` · Published ${new Date(postmortem.published_at).toLocaleString()}`}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {postmortem.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}