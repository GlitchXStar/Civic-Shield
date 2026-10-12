
import { Link, NavLink } from "react-router-dom";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import Button from "./ui/Button";

const links = [
  ["/", "Home"],
  ["/emergency", "Emergency"],
  ["/safety-resources", "Safety"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#087f76] text-white shadow-lg shadow-teal-900/10">
            <ShieldCheck size={22} />
          </span>

          <span>
            <span className="block text-[15px] font-extrabold tracking-tight text-slate-950">
              CrimeConnect
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Public safety platform
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Account Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Sign in
          </Link>

          <Button
            size="sm"
            onClick={() => (window.location.href = "/register")}
          >
            Create account
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <nav className="grid gap-1">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-700 hover:bg-teal-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex gap-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl bg-[#087f76] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}