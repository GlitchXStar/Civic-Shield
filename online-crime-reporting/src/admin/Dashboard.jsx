import { Users, Shield, FileText, BarChart3 } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";

export default function Dashboard() {
  return <PortalPage eyebrow="Admin / SHO" title="Administration dashboard" subtitle="Manage users, police officers, reports, assignments, analytics and audit activity."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Users} label="Users"/><Stat icon={Shield} label="Police officers"/><Stat icon={FileText} label="Reports"/><Stat icon={BarChart3} label="Analytics"/></div><div className="mt-6"><EmptyCard title="System overview" text="Administration metrics will appear after the secured admin API is connected." /></div></PortalPage>;
}
