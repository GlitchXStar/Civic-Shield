import { UserCog, ArrowRight } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function CaseAssignment() {
  const [saved,setSaved]=useState(false);
  return <PortalPage eyebrow="Admin / Case assignment" title="Case assignment" subtitle="Assign authorized cases to eligible police personnel."><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><EmptyCard title="Cases waiting for assignment" text="Assignment candidates will appear when returned by the admin API."/><form onSubmit={(e)=>{e.preventDefault();setSaved(true)}} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><UserCog className="text-teal-700"/><h2 className="font-extrabold">Assignment controls</h2></div>{saved&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Assignment API is not connected. Nothing was changed.</p>}<label className="mt-5 grid gap-2 text-sm font-semibold">Case<select required className="h-12 rounded-xl border border-slate-200 px-4"><option value="">Select a case</option></select></label><label className="mt-5 grid gap-2 text-sm font-semibold">Officer<select required className="h-12 rounded-xl border border-slate-200 px-4"><option value="">Select an officer</option></select></label><Button type="submit" className="mt-5">Assign case <ArrowRight size={16}/></Button></form></div></PortalPage>;
}
