import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Forbidden, Loading } from "./UI.jsx";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading label="Restoring session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ allow }) {
  const { role } = useAuth();
  if (!allow.includes(role)) return <Forbidden />;
  return <Outlet />;
}
