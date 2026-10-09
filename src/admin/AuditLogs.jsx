import { ClipboardList, Search } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function AuditLogs() {
  return <PortalPage eyebrow="Admin / Audit logs" title="Audit logs" subtitle="Review system actions returned by the secure audit service."><div className="mb-5 relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search audit events" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"/></div><EmptyCard title="No audit events" text="Audit events will appear here when the backend audit service is connected." action={<ClipboardList className="mx-auto mt-5 text-slate-300"/>}/></PortalPage>;
}
