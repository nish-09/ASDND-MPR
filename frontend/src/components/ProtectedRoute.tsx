import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, Role } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRole?: Role;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="neo-flex-center neo-page-min-height">
        <div className="neo-card">
          <h2>Authenticating...</h2>
          <p className="neo-text-muted">Verifying your session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const rolesToCheck = allowedRoles ?? (allowedRole ? [allowedRole] : undefined);

  if (rolesToCheck && !rolesToCheck.includes(user.role)) {
    return (
      <div className="neo-flex-center neo-page-min-height">
        <div className="neo-card neo-max-w-600">
          <span className="neo-tag neo-mb-4">Access Denied</span>
          <h2>403 Forbidden</h2>
          <p className="neo-mb-4">
            Your account role (<strong>{user.role}</strong>) does not have permission to view this page.
          </p>
          <a href="/" className="neo-btn">Return Home</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
