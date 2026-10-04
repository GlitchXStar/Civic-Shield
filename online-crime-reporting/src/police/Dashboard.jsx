import { Inbox, BriefcaseBusiness, FileText } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";

export default function Dashboard() {
  return <PortalPage eyebrow="Police / Dashboard" title="Police workspace" subtitle="Review incoming reports, manage assigned cases and access investigation tools."><div className="grid gap-4 sm:grid-cols-3"><Stat icon={Inbox} label="New reports"/><Stat icon={BriefcaseBusiness} label="Assigned cases"/><Stat icon={FileText} label="Reports"/></div><div className="mt-6"><EmptyCard title="Incoming work" text="Police data will appear here when the secured police API is connected." /></div></PortalPage>;
}
