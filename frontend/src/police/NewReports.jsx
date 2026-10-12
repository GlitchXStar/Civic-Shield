import { Search, Inbox } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function NewReports() {
  return <PortalPage eyebrow="Police / New reports" title="New reports" subtitle="Review reports available to authorized police personnel."><div className="mb-5 flex gap-3"><div className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search incoming reports" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"/></div><select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select></div><EmptyCard title="No new reports" text="New reports returned by the police API will appear here." action={<Inbox className="mx-auto mt-5 text-slate-300"/>}/></PortalPage>;
}
