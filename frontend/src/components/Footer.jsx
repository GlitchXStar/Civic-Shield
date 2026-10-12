import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#087f76] text-white"><ShieldCheck size={22} /></span>
            <span className="font-extrabold text-slate-950">CrimeConnect</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            A digital interface for submitting, tracking and managing crime reports. Emergency situations should always use official emergency channels.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">Public</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <Link to="/how-it-works" className="hover:text-teal-700">How it works</Link>
            <Link to="/emergency" className="hover:text-teal-700">Emergency information</Link>
            <Link to="/safety-resources" className="hover:text-teal-700">Safety resources</Link>
            <Link to="/contact" className="hover:text-teal-700">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">Account</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <Link to="/login" className="hover:text-teal-700">Sign in</Link>
            <Link to="/register" className="hover:text-teal-700">Register</Link>
            <Link to="/forgot-password" className="hover:text-teal-700">Forgot password</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <span className="flex gap-2"><Mail size={16} /> Use your organization’s official support channel</span>
            <span className="flex gap-2"><Phone size={16} /> Official emergency services for urgent situations</span>
            <span className="flex gap-2"><MapPin size={16} /> Your local police jurisdiction</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CrimeConnect. Frontend interface.
      </div>
    </footer>
  );
}
