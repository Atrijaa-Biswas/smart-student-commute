import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, Component } from 'react'
import { useAuth } from './hooks/useAuth.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import Login from './routes/Login'
import Signup from './routes/Signup'
import Dashboard from './routes/Dashboard'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled render error:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-6">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-sm">Please refresh the page. If the issue persists, check the browser console and restart the app.</p>
            <pre className="mt-4 text-xs bg-white p-3 rounded border border-red-200 text-red-700 overflow-auto">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function AppContent() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="font-inter min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App

