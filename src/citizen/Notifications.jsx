import { Bell, CheckCheck } from "lucide-react";
import { PortalPage } from "./Dashboard";

export default function Notifications() {
  return <PortalPage eyebrow="Citizen / Notifications" title="Notifications" subtitle="Important updates from your reporting workspace will appear here."><div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><Bell className="text-teal-700" /><h2 className="font-extrabold">Your notifications</h2></div><div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"><CheckCheck className="mx-auto text-slate-400" /><p className="mt-3 font-bold text-slate-700">No notifications</p><p className="mt-1 text-sm text-slate-500">There are no notifications to display.</p></div></div></PortalPage>;
}
