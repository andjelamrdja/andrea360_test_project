import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";

export function RequireAuth() {
  const { me, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!me) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
