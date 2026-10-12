import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clipboard, Search, Paperclip, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { PortalPage } from "../citizen/Dashboard";
import Button from "../components/ui/Button";
import { policeApi } from "../services/api";

export default function CaseDetails() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadCase = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await policeApi.getCaseDetails(id);
      if (res.data) {
        const c = res.data.case || res.data;
        setCaseData(c);
        setNewStatus(c.status || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load case details or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCase();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === caseData?.status) return;

    try {
      setUpdating(true);
      setStatusMessage({ type: "", text: "" });
      await policeApi.updateStatus(id, newStatus, remarks);
      setStatusMessage({ type: "success", text: `Case status updated to ${newStatus}` });
      setRemarks("");
      loadCase();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Invalid status transition" });
    } finally {
      setUpdating(false);
    }
  };

  const caseNum = caseData?.caseNumber || caseData?.trackingId || id;

  return (
    <PortalPage eyebrow="Police / Case details" title="Case details" subtitle={`Case reference: ${caseNum}`}>
      <Link to="/police/assigned-cases" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline">
        <ArrowLeft size={16} /> Back to assigned cases
      </Link>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex h-48 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-700" />
        </div>
      ) : caseData ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <div className="space-y-6">
            {/* Main case info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 uppercase">
                  {caseData.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 capitalize">
                  Status: {caseData.status?.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{caseData.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {caseData.description}
              </p>

              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 text-sm">
                <div>
                  <span className="font-semibold text-slate-500">Incident Date:</span>
                  <p className="font-bold text-slate-900">
                    {caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Location:</span>
                  <p className="font-bold text-slate-900">
                    {caseData.location?.address || caseData.location?.city || "Registered location"}
                  </p>
                </div>
                {caseData.submittedBy && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">Reported By:</span>
                    <p className="font-bold text-slate-900">
                      {caseData.submittedBy.fullName || caseData.submittedBy.name || "Citizen"} · {caseData.submittedBy.phone || ""} {caseData.submittedBy.email ? `(${caseData.submittedBy.email})` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Subsections */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <Search className="text-teal-700" size={24} />
                  <h3 className="mt-3 font-extrabold text-slate-900">Investigation Notes</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Review and append chronological case notes and findings.
                  </p>
                </div>
                <Link
                  to={`/police/cases/${id}/investigation`}
                  className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline"
                >
                  Open investigation →
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <Paperclip className="text-teal-700" size={24} />
                  <h3 className="mt-3 font-extrabold text-slate-900">Evidence Vault</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Upload and inspect secure case attachments and media.
                  </p>
                </div>
                <Link
                  to={`/police/cases/${id}/evidence`}
                  className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline"
                >
                  Open evidence →
                </Link>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm h-fit">
            <h3 className="text-lg font-extrabold text-slate-900">Update Case Status</h3>
            <p className="mt-1 text-xs text-slate-500">
              Only authorized assigned officers can update state transitions.
            </p>

            {statusMessage.text && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                  statusMessage.type === "success"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="mt-5 space-y-4">
              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                New Status
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-teal-500"
                >
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                Transition Remarks
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason or notes regarding status change..."
                  className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-500"
                />
              </label>

              <Button type="submit" disabled={updating || newStatus === caseData.status} className="w-full">
                {updating ? <Loader2 size={16} className="animate-spin" /> : "Save Status"}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </PortalPage>
  );
}
