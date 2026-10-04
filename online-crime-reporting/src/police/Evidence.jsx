import { useParams } from "react-router-dom";
import { Upload, Paperclip } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function Evidence() {
  const { id } = useParams();
  return <PortalPage eyebrow="Police / Evidence" title="Evidence" subtitle={`Case reference: ${id}`}><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><EmptyCard title="Evidence records" text="Evidence metadata returned by the backend will appear here."/><label className="grid min-h-64 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center"><div><Upload className="mx-auto text-teal-700"/><p className="mt-4 font-bold">Add evidence files</p><p className="mt-1 text-sm text-slate-500">Files are selected in the browser and are ready for API upload.</p><input type="file" multiple className="sr-only"/></div></label></div></PortalPage>;
}
