import { Navigate, useLocation } from 'react-router-dom';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/banking" replace />;
  }

  return children;
}

export default ProtectedRoute;
