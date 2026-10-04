import { UserRound, Save } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { PortalPage } from "../citizen/Dashboard";

export default function Profile() {
  const [saved,setSaved]=useState(false);
  return <PortalPage eyebrow="Admin / Profile" title="Administrator profile" subtitle="Manage the profile information associated with your administration account."><form onSubmit={(e)=>{e.preventDefault();setSaved(true)}} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><UserRound className="text-teal-700"/><h2 className="font-extrabold">Account information</h2></div>{saved&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Profile API is not connected. Nothing was saved.</p>}<div className="mt-6 grid gap-5 md:grid-cols-2">{["Full name","Official email","Role","Phone"].map((x)=><label key={x} className="grid gap-2 text-sm font-semibold">{x}<input className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"/></label>)}</div><Button type="submit" className="mt-6"><Save size={17}/> Save changes</Button></form></PortalPage>;
}
