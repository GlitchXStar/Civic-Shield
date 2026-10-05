import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import PoliceSidebar from "../components/PoliceSidebar";
import PortalHeader from "../components/PortalHeader";
import { useAuth } from "../context/AuthContext";

export default function PoliceLayout() {
  const [menu, setMenu] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'POLICE') return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;

  return (
    <div className="min-h-screen bg-[#f7fbfa] lg:flex">
      <PoliceSidebar />
      {menu && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden" onClick={() => setMenu(false)}>
          <div className="h-full w-80 max-w-[88vw] bg-white" onClick={(e) => e.stopPropagation()}>
            <PoliceSidebar mobile onClose={() => setMenu(false)} />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <PortalHeader role="Police" onMenu={() => setMenu(true)} />
        <main className="app-grid min-h-[calc(100vh-4.5rem)]"><Outlet /></main>
      </div>
    </div>
  );
}
