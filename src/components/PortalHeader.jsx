import { Menu, Bell, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROLE_LABELS, useAuth } from "../auth/AuthContext";

export default function PortalHeader({ role, onMenu }) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const roleKey = session?.role || (role === "Citizen" ? "citizen" : role === "Police" ? "police" : "admin");
  const label = ROLE_LABELS[roleKey] || role;

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden" aria-label="Open menu">
          <Menu size={19} />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-900">Online reporting portal</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {roleKey === "citizen" ? (
          <Link to="/citizen/notifications" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={19} /></Link>
        ) : (
          <button className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Notifications" title="Notifications will be connected to the backend"><Bell size={19} /></button>
        )}

        <div className="group relative">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">{session?.name?.[0]?.toUpperCase() || "U"}</span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">{session?.name || "Account"}</span>
            <ChevronDown size={15} className="text-slate-400" />
          </button>
          <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100">
            <Link to={`/${roleKey}/profile`} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Profile</Link>
            <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={16}/> Sign out</button>
          </div>
        </div>
      </div>
    </header>
  );
}
