import { FileText, Download } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function Reports() {
  return <PortalPage eyebrow="Police / Reports" title="Reports" subtitle="Generate and review authorized operational reports."><div className="mb-5 flex justify-end"><Button variant="outline"><Download size={17}/> Export</Button></div><EmptyCard title="No report data" text="Report data will be loaded from the police reporting API." action={<FileText className="mx-auto mt-5 text-slate-300"/>}/></PortalPage>;
}
