import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
<   div className="w-48 min-w-48 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="text-sm font-medium text-white">Hindsight</div>
        <div className="text-xs text-gray-500 mt-0.5">Incident postmortems</div>
      </div>

      <div className="px-4 pt-3 pb-1 text-xs text-gray-600 uppercase tracking-wider font-medium">
        Workspace
      </div>

      <nav className="flex flex-col">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 text-sm border-l-2 transition-colors ${
              isActive
                ? 'text-white bg-gray-800 border-violet-500'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/incidents"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 text-sm border-l-2 transition-colors ${
              isActive
                ? 'text-white bg-gray-800 border-violet-500'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
            }`
          }
        >
          Incidents
        </NavLink>
        <NavLink
          to="/postmortems"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 text-sm border-l-2 transition-colors ${
              isActive
                ? 'text-white bg-gray-800 border-violet-500'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
            }`
          }
        >
          Postmortems
        </NavLink>

        <div className="px-4 pt-4 pb-1 text-xs text-gray-600 uppercase tracking-wider font-medium">
          Account
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 text-sm border-l-2 transition-colors ${
              isActive
                ? 'text-white bg-gray-800 border-violet-500'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
            }`
          }
        >
          Settings
        </NavLink>
      </nav>

      <div className="mt-auto px-4 py-3 border-t border-gray-800 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-violet-900 flex items-center justify-center text-xs font-medium text-violet-200">
          {user?.display_name?.slice(0, 2).toUpperCase() || 'U'}
        </div>
        <span className="text-xs text-gray-400 flex-1 truncate">{user?.display_name}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Out
        </button>
      </div>
    </div>
  )
}