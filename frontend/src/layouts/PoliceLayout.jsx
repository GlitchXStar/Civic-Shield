import { Outlet } from "react-router-dom";
import { useState } from "react";
import PoliceSidebar from "../components/PoliceSidebar";
import PortalHeader from "../components/PortalHeader";

export default function PoliceLayout() {
  const [menu, setMenu] = useState(false);

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
