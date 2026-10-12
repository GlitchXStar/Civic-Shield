import { Inbox, BriefcaseBusiness, FileText, MapPin } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";
import CrimeMap from "../components/CrimeMap";

export default function Dashboard() {
  const markers = [
    { id: "P-2041", position: [19.076, 72.8777], title: "P-2041 · Pending review" },
    { id: "P-2042", position: [19.033, 73.0297], title: "P-2042 · Assigned case" },
    { id: "P-2043", position: [19.2183, 72.9781], title: "P-2043 · Investigation" },
  ];

  return <PortalPage eyebrow="Police / Dashboard" title="Police workspace" subtitle="Review incoming reports, manage assigned cases and access investigation tools.">
    <div className="grid gap-4 sm:grid-cols-3"><Stat icon={Inbox} label="New reports"/><Stat icon={BriefcaseBusiness} label="Assigned cases"/><Stat icon={FileText} label="Reports"/></div>
    <div className="mt-6"><EmptyCard title="Incoming work" text="Police data will appear here when the secured police API is connected." /></div>
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-800"><MapPin size={19}/></span><div><h2 className="font-extrabold text-slate-950">Case locations</h2><p className="text-sm text-slate-500">OpenStreetMap view for operational awareness.</p></div></div>
      <div className="mt-5"><CrimeMap markers={markers} height={360}/></div>
    </section>
  </PortalPage>;
}
