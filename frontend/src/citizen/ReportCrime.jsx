import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, MapPin, Upload, CheckCircle2, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage } from "./Dashboard";
import CrimeMap from "../components/CrimeMap";
import { useAuth } from "../auth/AuthContext";
import { citizenApi, evidenceApi } from "../services/api";

export default function ReportCrime() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    incidentDate: new Date().toISOString().split("T")[0],
    incidentTime: "12:00",
    description: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    contactMethod: "Phone",
  });

  const [location, setLocation] = useState([19.076, 72.8777]); // Default Mumbai
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.category) {
      setError("Please select a crime category.");
      return;
    }

    try {
      setSubmitting(true);

      // Construct incidentDate ISO string
      let fullIncidentDate = new Date().toISOString();
      if (formData.incidentDate) {
        const timePart = formData.incidentTime ? `${formData.incidentTime}:00` : "12:00:00";
        const combined = new Date(`${formData.incidentDate}T${timePart}`);
        if (!isNaN(combined.getTime())) {
          fullIncidentDate = combined.toISOString();
        }
      }

      const reportPayload = {
        title: formData.title || `${formData.category} Incident`,
        category: formData.category,
        description: formData.description,
        incidentDate: fullIncidentDate,
        location: {
          address: formData.address || (location ? `Coordinates: ${location[0].toFixed(4)}, ${location[1].toFixed(4)}` : "Reported Location"),
          city: formData.city || "City",
          state: formData.state || "State",
          pincode: formData.pincode || "000000",
          coordinates: location ? { lat: location[0], lng: location[1] } : undefined,
        },
      };

      const res = await citizenApi.submitReport(reportPayload);
      const createdReport = res.data?.report || res.data;
      const reportId = createdReport?._id || createdReport?.id;
      const caseNumber = createdReport?.caseNumber || createdReport?.trackingId || reportId;

      let fileUploadWarning = "";
      if (files.length > 0 && reportId) {
        try {
          await evidenceApi.uploadEvidence(reportId, files, "Supporting evidence uploaded during report submission");
        } catch (uploadErr) {
          fileUploadWarning = `Report created successfully, but evidence files failed to upload: ${uploadErr.message}`;
        }
      }

      setSuccessInfo({
        caseNumber,
        reportId,
        warning: fileUploadWarning,
      });
    } catch (err) {
      setError(err.message || "Failed to submit crime report. Please check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalPage eyebrow="Citizen / Report crime" title="Report a crime" subtitle="Provide accurate information. Required fields are marked with an asterisk.">
      {successInfo ? (
        <div className="rounded-3xl border border-teal-200 bg-teal-50/60 p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-600 text-white shadow-soft">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900">Crime Report Submitted Successfully</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your report has been logged and assigned the reference tracking number:
          </p>
          <div className="mt-4 inline-block rounded-xl border border-teal-300 bg-white px-6 py-2.5 text-lg font-black tracking-wider text-teal-800 shadow-xs">
            {successInfo.caseNumber}
          </div>
          {successInfo.warning && (
            <p className="mt-3 text-xs font-semibold text-amber-800">{successInfo.warning}</p>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <Link to={`/citizen/track-case/${successInfo.reportId}`}>
              <Button size="lg">Track Case Now</Button>
            </Link>
            <Link to="/citizen/my-reports">
              <Button variant="outline" size="lg">View My Reports</Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
              <AlertCircle size={19} /> {error}
            </div>
          )}

          <Section title="Incident information" icon={FileText}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Report Title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Theft of bicycle near metro station"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Crime category *
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500"
                >
                  <option value="" disabled>Select category</option>
                  <option value="Theft">Theft</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Cyber crime">Cyber crime</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Missing person">Missing person</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Date of incident *
                <input
                  required
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Time of incident
                <input
                  type="time"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Street address or landmark
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Near Gate 3, Andheri West Station"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                City
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-sm font-semibold">
                  State
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Pincode
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Coordinates
                <span className="relative">
                  <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    readOnly
                    value={location ? `${location[0].toFixed(5)}, ${location[1].toFixed(5)}` : ""}
                    placeholder="Click a point on the map below"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 outline-none"
                  />
                </span>
              </label>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <LocateFixed size={16} className="text-teal-700" /> Select incident location on OpenStreetMap
                </div>
                <CrimeMap selectable value={location} onChange={setLocation} height={360} />
                <p className="mt-2 text-xs text-slate-500">
                  Click the map to place the incident marker. Coordinates will be submitted with your official report.
                </p>
              </div>

              <label className="md:col-span-2 grid gap-2 text-sm font-semibold">
                Description *
                <textarea
                  required
                  rows="6"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what happened as clearly as possible..."
                  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500"
                />
              </label>
            </div>
          </Section>

          <Section title="Your contact details" icon={FileText}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Full name
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Phone number
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Preferred contact method
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleChange}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500"
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Supporting files & evidence" icon={Upload}>
            <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-teal-300">
              <div>
                <Upload className="mx-auto text-teal-700" />
                <p className="mt-3 font-bold text-slate-700">Choose supporting files</p>
                <p className="mt-1 text-xs text-slate-500">
                  {files.length > 0 
                    ? `${files.length} file(s) selected: ${files.map(f => f.name).join(", ")}` 
                    : "Attach images, PDFs, or documents as evidence (Max 10MB each)"}
                </p>
              </div>
              <input type="file" multiple onChange={handleFileChange} className="sr-only" />
            </label>
          </Section>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <input required type="checkbox" className="mt-1" />
            I confirm that the information provided is accurate and authentic to the best of my knowledge.
          </label>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting report...
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </div>
        </form>
      )}
    </PortalPage>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={19} />
        </span>
        <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
