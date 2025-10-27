import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AdminRoute
