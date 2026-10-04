import { Link } from "react-router-dom";
import { FileText, Clock3, CheckCircle2, ArrowRight, FilePlus2 } from "lucide-react";
import Button from "../components/ui/Button";

export default function Dashboard() {
  return (
    <PortalPage eyebrow="Citizen dashboard" title="Your reporting workspace" subtitle="Manage reports, track case progress and keep your account information up to date.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FileText} label="Total reports" />
        <Stat icon={Clock3} label="Active cases" />
        <Stat icon={CheckCircle2} label="Resolved cases" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <EmptyCard title="Recent reports" text="Reports submitted through your account will appear here once the reporting API is connected." />
        <div className="rounded-3xl bg-[#087f76] p-6 text-white">
          <FilePlus2 size={24} />
          <h2 className="mt-5 text-xl font-extrabold">Ready to report?</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">Use the guided form to provide incident information.</p>
          <Link to="/citizen/report-crime" className="mt-5 inline-block"><Button variant="secondary">Report a crime <ArrowRight size={16} /></Button></Link>
        </div>
      </div>
    </PortalPage>
  );
}

export function PortalPage({ eyebrow, title, subtitle, children }) {
  return <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}<div className="mt-8">{children}</div></div>;
}

export function Stat({ icon: Icon, label }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={19} /></span><span className="text-2xl font-black text-slate-300">—</span></div><p className="mt-4 text-sm font-semibold text-slate-500">{label}</p></div>;
}

export function EmptyCard({ title, text, action }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="font-bold text-slate-700">No data available</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>{action}</div></div>;
}
