import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PortalHeader({ role, onMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors">
            <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">{user?.name || "Account"}</span>
            <ChevronDown size={15} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              <Link
                to={`/${base}/profile`}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  document.documentElement.classList.toggle('dark');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Toggle Theme
              </button>
              <hr className="my-2 border-slate-100" />
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
