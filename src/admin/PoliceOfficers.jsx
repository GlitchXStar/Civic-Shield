import { Shield, Search } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function PoliceOfficers() {
  return <PortalPage eyebrow="Admin / Police officers" title="Police officers" subtitle="Manage authorized police personnel and their roles."><div className="mb-5 relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search officers" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"/></div><EmptyCard title="No officers available" text="Officer records will be loaded from the administration API." action={<Shield className="mx-auto mt-5 text-slate-300"/>}/></PortalPage>;
}
