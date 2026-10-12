import { useState } from "react";
import { FileText, MapPin, Upload, CheckCircle2, LocateFixed } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage } from "./Dashboard";
import CrimeMap from "../components/CrimeMap";

export default function ReportCrime() {
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null);

  return (
    <PortalPage eyebrow="Citizen / Report crime" title="Report a crime" subtitle="Provide accurate information. Required fields are marked with an asterisk.">
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="grid gap-6">
        {submitted && <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800"><CheckCircle2 size={19} /> The frontend form validated successfully. Connect your API to actually submit and store this report.</div>}
        <Section title="Incident information" icon={FileText}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Crime category" required select options={["Select category", "Theft", "Fraud", "Cyber crime", "Harassment", "Missing person", "Other"]} />
            <Field label="Date of incident" required type="date" />
            <Field label="Time of incident" type="time" />
            <label className="grid gap-2 text-sm font-semibold md:col-span-2">
              Location
              <span className="relative">
                <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required readOnly value={location ? `${location[0].toFixed(5)}, ${location[1].toFixed(5)}` : ""} placeholder="Click a point on the map below" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 outline-none" />
              </span>
            </label>
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><LocateFixed size={16} className="text-teal-700"/> Select incident location on OpenStreetMap</div>
              <CrimeMap selectable value={location} onChange={setLocation} height={360} />
              <p className="mt-2 text-xs text-slate-500">Click the map to place the incident marker. Coordinates will be submitted with the report once your API is connected.</p>
            </div>
            <label className="md:col-span-2 grid gap-2 text-sm font-semibold">Description <textarea required rows="6" placeholder="Describe what happened as clearly as possible..." className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500" /></label>
          </div>
        </Section>

        <Section title="Your information" icon={FileText}>
          <div className="grid gap-5 md:grid-cols-2"><Field label="Full name" required /><Field label="Phone number" required type="tel" /><Field label="Email" type="email" /><Field label="Preferred contact method" select options={["Select method", "Phone", "Email"]} /></div>
        </Section>

        <Section title="Supporting files" icon={Upload}>
          <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-teal-300"><div><Upload className="mx-auto text-teal-700" /><p className="mt-3 font-bold text-slate-700">Choose supporting files</p><p className="mt-1 text-xs text-slate-500">The selected files will be available to your eventual API submission.</p></div><input type="file" multiple className="sr-only" /></label>
        </Section>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600"><input required type="checkbox" className="mt-1" /> I confirm that the information provided is accurate to the best of my knowledge.</label>
        <div className="flex justify-end"><Button type="submit" size="lg">Validate report</Button></div>
      </form>
    </PortalPage>
  );
}

function Section({ title, icon: Icon, children }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={19} /></span><h2 className="text-lg font-extrabold text-slate-950">{title}</h2></div><div className="mt-6">{children}</div></section>;
}

function Field({ label, required, type = "text", select, options, icon: Icon, placeholder }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{select ? <select required={required} className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500">{options.map((o, i) => <option key={o} value={i === 0 ? "" : o} disabled={i === 0}>{o}</option>)}</select> : <span className="relative">{Icon && <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}<input required={required} type={type} placeholder={placeholder} className={`h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500 ${Icon ? "pl-11" : ""}`} /></span>}</label>;
}
