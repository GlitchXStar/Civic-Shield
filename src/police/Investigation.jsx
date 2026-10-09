import { useParams } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function Investigation() {
  const { id } = useParams();
  const [saved, setSaved] = useState(false);
  return <PortalPage eyebrow="Police / Investigation" title="Investigation" subtitle={`Case reference: ${id}`}><div className="grid gap-6 lg:grid-cols-[1fr_.7fr]"><EmptyCard title="Investigation activity" text="Investigation entries will appear here when the secured backend returns them."/><form onSubmit={(e)=>{e.preventDefault();setSaved(true)}} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><Plus className="text-teal-700"/><h2 className="font-extrabold">Add investigation note</h2></div>{saved&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">Investigation API is not connected. Nothing was stored.</p>}<textarea required rows="7" placeholder="Enter investigation note..." className="mt-5 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500"/><Button type="submit" className="mt-4">Save note</Button></form></div></PortalPage>;
}
