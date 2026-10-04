import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, Inbox, BriefcaseBusiness, FileText, UserRound, ShieldCheck, X } from "lucide-react";

const items = [
  ["/police/dashboard", "Dashboard", LayoutDashboard],
  ["/police/new-reports", "New reports", Inbox],
  ["/police/assigned-cases", "Assigned cases", BriefcaseBusiness],
  ["/police/reports", "Reports", FileText],
  ["/police/profile", "Profile", UserRound],
];

export default function PoliceSidebar({ mobile = false, onClose }) {
  return (
    <aside className={`${mobile ? "w-full" : "hidden w-64 shrink-0 lg:flex"} border-r border-slate-200 bg-white`}>
      <div className="flex min-h-screen w-full flex-col p-4">
        <div className="flex items-center justify-between px-2 py-2">
          <Link to="/police/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-white"><ShieldCheck size={19} /></span>
            <span className="font-extrabold text-slate-950">CrimeConnect</span>
          </Link>
          {mobile && <button onClick={onClose}><X size={20} /></button>}
        </div>

        <p className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Police workspace</p>

        <nav className="mt-3 grid gap-1">
          {items.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`
            }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
