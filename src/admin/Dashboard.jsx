import { Users, Shield, FileText, BarChart3, MapPin } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";
import CrimeMap from "../components/CrimeMap";

export default function Dashboard() {
  const markers = [
    { id: "A-1001", position: [19.076, 72.8777], title: "A-1001 · Theft" },
    { id: "A-1002", position: [19.0176, 73.1002], title: "A-1002 · Cyber crime" },
    { id: "A-1003", position: [19.2183, 72.9781], title: "A-1003 · Fraud" },
  ];

  return <PortalPage eyebrow="Admin / SHO" title="Administration dashboard" subtitle="Manage users, police officers, reports, assignments, analytics and audit activity.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Users} label="Users"/><Stat icon={Shield} label="Police officers"/><Stat icon={FileText} label="Reports"/><Stat icon={BarChart3} label="Analytics"/></div>
    <div className="mt-6"><EmptyCard title="System overview" text="Administration metrics will appear after the secured admin API is connected." /></div>
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><MapPin size={19}/></span><div><h2 className="font-extrabold text-slate-950">Report distribution</h2><p className="text-sm text-slate-500">OpenStreetMap overview of demo incident locations.</p></div></div>
      <div className="mt-5"><CrimeMap markers={markers} height={380}/></div>
    </section>
  </PortalPage>;
}
