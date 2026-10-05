import { useState } from "react";
import { FileText, MapPin, Upload, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage } from "./Dashboard";
import api from "../api";

export default function ReportCrime() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    const form = e.target;
    try {
      // 1. Submit report data
      const res = await api.post('/citizen/reports', {
        category: form.category.value,
        incidentDate: form.incidentDate.value,
        timeOfIncident: form.timeOfIncident.value || undefined,
        location: {
          address: form.locationAddress.value,
          city: "Simulated City",
          state: "Simulated State",
          pincode: "000000"
        },
        description: form.description.value,
        contactPreference: form.contactPreference.value === 'Select method' ? 'EMAIL' : form.contactPreference.value.toUpperCase()
      });

      const reportId = res.data.data.report._id;

      // 2. Upload files if selected
      if (files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));
        await api.post(`/evidence/cases/${reportId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSubmitted(true);
      form.reset();
      setFiles([]);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalPage eyebrow="Citizen / Report crime" title="Report a crime" subtitle="Provide accurate information. Required fields are marked with an asterisk.">
      <form onSubmit={handleSubmit} className="grid gap-6">
        {submitted && <div className="flex gap-3 rounded-2xl bg-teal-50 p-4 text-sm font-semibold text-teal-800"><CheckCircle2 size={19} /> Crime report and associated evidence submitted successfully.</div>}
        {formError && <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800">{formError}</div>}
        <Section title="Incident information" icon={FileText}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field name="category" label="Crime category" required select options={["Select category", "Theft", "Fraud", "Cyber crime", "Harassment", "Missing person", "Other"]} />
            <Field name="incidentDate" label="Date of incident" required type="date" />
            <Field name="timeOfIncident" label="Time of incident" type="time" />
            <Field name="locationAddress" label="Location" required icon={MapPin} placeholder="Incident location" />
            <label className="md:col-span-2 grid gap-2 text-sm font-semibold">Description <textarea name="description" required rows="6" placeholder="Describe what happened as clearly as possible..." className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500" /></label>
          </div>
        </Section>

        <Section title="Your information" icon={FileText}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field name="fullName" label="Full name" required />
            <Field name="phoneNumber" label="Phone number" required type="tel" />
            <Field name="emailAddress" label="Email" type="email" />
            <Field name="contactPreference" label="Preferred contact method" select options={["Select method", "Phone", "Email"]} />
          </div>
        </Section>

        <Section title="Supporting files" icon={Upload}>
          <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-teal-300">
            <div>
              <Upload className="mx-auto text-teal-700" />
              <p className="mt-3 font-bold text-slate-700">Choose supporting files</p>
              <p className="mt-1 text-xs text-slate-500">{files.length > 0 ? `${files.length} file(s) selected` : "Select files for your API submission."}</p>
            </div>
            <input type="file" multiple className="sr-only" onChange={(e) => setFiles(e.target.files)} />
          </label>
        </Section>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600"><input required type="checkbox" className="mt-1" /> I confirm that the information provided is accurate to the best of my knowledge.</label>
        <div className="flex justify-end"><Button type="submit" size="lg" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</Button></div>
      </form>
    </PortalPage>
  );
}

function Section({ title, icon: Icon, children }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={19} /></span><h2 className="text-lg font-extrabold text-slate-950">{title}</h2></div><div className="mt-6">{children}</div></section>;
}

function Field({ name, label, required, type = "text", select, options, icon: Icon, placeholder }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{select ? <select name={name} required={required} className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500">{options.map((o, i) => <option key={o} value={i === 0 ? "" : o} disabled={i === 0}>{o}</option>)}</select> : <span className="relative">{Icon && <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}<input name={name} required={required} type={type} placeholder={placeholder} className={`h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500 ${Icon ? "pl-11" : ""}`} /></span>}</label>;
}
