import { Link } from "react-router-dom";
import { Search, FileText } from "lucide-react";
import { PortalPage, EmptyCard } from "./Dashboard";

export default function MyReports() {
  return (
    <PortalPage eyebrow="Citizen / My reports" title="My reports" subtitle="View submitted reports and open a case to see available status information.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input placeholder="Search reports" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500" /></div><select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><option>All statuses</option><option>Submitted</option><option>Under review</option><option>Closed</option></select></div>
      <EmptyCard title="No reports available" text="When reports are returned by your backend, they will appear here with their status and tracking link." action={<Link to="/citizen/report-crime" className="mt-5 inline-block text-sm font-bold text-teal-700">Report a crime →</Link>} />
    </PortalPage>
  );
}
