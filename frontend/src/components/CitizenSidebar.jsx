import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, FilePlus2, Files, Bell, UserRound, ShieldCheck, X } from "lucide-react";

const items = [
  ["/citizen/dashboard", "Dashboard", LayoutDashboard],
  ["/citizen/report-crime", "Report crime", FilePlus2],
  ["/citizen/my-reports", "My reports", Files],
  ["/citizen/notifications", "Notifications", Bell],
  ["/citizen/profile", "Profile", UserRound],
];

export default function CitizenSidebar({ mobile = false, onClose }) {
  return (
    <aside className={`${mobile ? "w-full" : "hidden w-64 shrink-0 lg:flex"} border-r border-slate-200 bg-white`}>
      <div className="flex min-h-screen w-full flex-col p-4">
        <div className="flex items-center justify-between px-2 py-2">
          <Link to="/citizen/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid size-9 place-items-center rounded-xl bg-[#087f76] text-white"><ShieldCheck size={19} /></span>
            <span className="font-extrabold text-slate-950">CrimeConnect</span>
          </Link>
          {mobile && <button onClick={onClose}><X size={20} /></button>}
        </div>

        <p className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Citizen portal</p>

        <nav className="mt-3 grid gap-1">
          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-sm font-bold">Need immediate help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Use your official local emergency service for immediate danger.</p>
          <Link to="/emergency" onClick={onClose} className="mt-3 inline-block text-xs font-bold text-teal-300">Emergency information →</Link>
        </div>
      </div>
    </aside>
  );
}
