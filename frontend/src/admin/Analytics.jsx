import { BarChart3, TrendingUp } from "lucide-react";
import { PortalPage } from "../citizen/Dashboard";

export default function Analytics() {
  return <PortalPage eyebrow="Admin / Analytics" title="Analytics" subtitle="System-level metrics and trends will be rendered from authorized backend data."><div className="grid gap-5 lg:grid-cols-2">{["Reports over time","Resolution overview","Category distribution","Operational workload"].map((title)=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><BarChart3 className="text-teal-700"/><h2 className="font-extrabold">{title}</h2></div><div className="mt-8 grid h-44 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50"><div className="text-center"><TrendingUp className="mx-auto text-slate-300"/><p className="mt-2 text-sm font-bold text-slate-500">No analytics data available</p></div></div></div>)}</div></PortalPage>;
}
