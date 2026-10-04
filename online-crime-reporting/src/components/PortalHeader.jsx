import { Menu, Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function PortalHeader({ role, onMenu }) {
  const base =
    role === "Citizen" ? "citizen" : role === "Police" ? "police" : "admin";

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden" aria-label="Open menu">
          <Menu size={19} />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{role}</p>
          <p className="text-sm font-bold text-slate-900">Online reporting portal</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {base === "citizen" ? (
          <Link to="/citizen/notifications" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={19} />
          </Link>
        ) : (
          <button className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Notifications" title="Notifications will be connected to the backend">
            <Bell size={19} />
          </button>
        )}

        <Link to={`/${base}/profile`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">U</span>
          <span className="hidden text-sm font-semibold text-slate-700 sm:block">Account</span>
          <ChevronDown size={15} className="text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
