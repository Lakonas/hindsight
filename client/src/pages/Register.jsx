import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        email,
        password,
        display_name: displayName,
      })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Hindsight</h1>
          <p className="text-sm text-gray-400 mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-700 hover:bg-violet-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}