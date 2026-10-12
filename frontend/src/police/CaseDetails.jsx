import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clipboard, Search, Paperclip } from "lucide-react";
import { PortalPage } from "../citizen/Dashboard";

export default function CaseDetails() {
  const { id } = useParams();
  return <PortalPage eyebrow="Police / Case details" title="Case details" subtitle={`Case reference: ${id}`}><Link to="/police/assigned-cases" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"><ArrowLeft size={16}/> Back to assigned cases</Link><div className="mt-6 grid gap-5 md:grid-cols-3">{[["Case information",Clipboard,"No case data available."],["Investigation",Search,"No investigation entries available."],["Evidence",Paperclip,"No evidence records available."]].map(([title,Icon,text])=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-6"><Icon className="text-teal-700"/><h2 className="mt-5 font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p><Link to={title==="Investigation"?`/police/cases/${id}/investigation`:title==="Evidence"?`/police/cases/${id}/evidence`:`#`} className="mt-5 inline-block text-sm font-bold text-teal-700">Open →</Link></div>)}</div></PortalPage>;
}
