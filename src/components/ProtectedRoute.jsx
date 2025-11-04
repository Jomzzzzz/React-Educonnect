// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

export default function ProtectedRoute({ children, roles }) {
  const { authenticated, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!authenticated) return <Navigate to="/" replace />;

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
