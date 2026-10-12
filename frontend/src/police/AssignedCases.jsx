import { Link } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";

export default function AssignedCases() {
  return <PortalPage eyebrow="Police / Assigned cases" title="Assigned cases" subtitle="Open an assigned case to review details, investigation activity and evidence."><EmptyCard title="No assigned cases" text="Assigned case records will appear here when returned by the police API." action={<Link to="/police/reports" className="mt-5 inline-block text-sm font-bold text-teal-700">Open reports →</Link>}/></PortalPage>;
}
