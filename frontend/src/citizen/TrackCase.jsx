import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleDot, FileText, MessageSquare, Paperclip } from "lucide-react";
import { PortalPage } from "./Dashboard";

export default function TrackCase() {
  const { id } = useParams();
  return (
    <PortalPage eyebrow="Citizen / Track case" title="Track case" subtitle={`Case reference: ${id}`}>
      <Link to="/citizen/my-reports" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"><ArrowLeft size={16} /> Back to reports</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <h2 className="text-lg font-extrabold">Case timeline</h2>
          <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"><CircleDot className="mx-auto text-teal-700" /><p className="mt-3 font-bold text-slate-700">No case events available</p><p className="mt-1 text-sm text-slate-500">Timeline data will appear after the backend returns case events.</p></div>
        </div>
        <div className="grid gap-4">
          {[["Report", FileText], ["Messages", MessageSquare], ["Evidence", Paperclip]].map(([name, Icon]) => <div key={name} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon size={19} className="text-teal-700" /><p className="mt-3 font-bold">{name}</p><p className="mt-1 text-xs text-slate-500">No data available.</p></div>)}
        </div>
      </div>
    </PortalPage>
  );
}
