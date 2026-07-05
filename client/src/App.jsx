import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IncidentDetail from './pages/IncidentDetail'
import Postmortem from './pages/Postmortem'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/incidents/:id" element={
          <ProtectedRoute>
            <AppLayout><IncidentDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/incidents/:id/postmortem" element={
          <ProtectedRoute>
            <AppLayout><Postmortem /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}