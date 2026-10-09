
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  let user = null;

  try {
    const storedUser = localStorage.getItem("crimeconnect_current_user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (!user) {
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

  const role = String(user.role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const normalizedAllowedRoles = allowedRoles.map((item) =>
    String(item).trim().toLowerCase().replace(/[\s-]+/g, "_")
  );

  if (!normalizedAllowedRoles.includes(role)) {
    const roleRoutes = {
      citizen: "/citizen/dashboard",
      police: "/police/dashboard",
      police_officer: "/police/dashboard",
      admin: "/admin/dashboard",
      administrator: "/admin/dashboard",
    };

    return <Navigate to={roleRoutes[role] || "/login"} replace />;
  }

  return <Outlet />;
}

