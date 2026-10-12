import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, normalizeRole } from "./AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "Please log in to access your dashboard.",
          from: location.pathname,
        }}
      />
    );
  }

  const normalizedRole = normalizeRole(role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (!normalizedAllowedRoles.includes(normalizedRole)) {
    const roleRoutes = {
      citizen: "/citizen/dashboard",
      police: "/police/dashboard",
      admin: "/admin/dashboard",
    };

    return <Navigate to={roleRoutes[normalizedRole] || "/login"} replace />;
  }

  return <Outlet />;
}
