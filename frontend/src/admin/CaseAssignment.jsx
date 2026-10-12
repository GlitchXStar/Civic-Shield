import { useState, useEffect } from "react";
import { UserCog, ArrowRight, Loader2, AlertCircle, CheckCircle2, Shield, Calendar, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { adminApi } from "../services/api";

export default function CaseAssignment() {
  const [unassignedCases, setUnassignedCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesRes, officersRes] = await Promise.all([
        adminApi.getUnassignedCases(),
        adminApi.getOfficers(),
      ]);

      const casesList = casesRes.data?.cases || (Array.isArray(casesRes.data) ? casesRes.data : []);
      const officersList = officersRes.data?.data || (Array.isArray(officersRes.data) ? officersRes.data : []);

      setUnassignedCases(casesList);
      setOfficers(officersList);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to load unassigned cases or officers" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCaseId || !selectedOfficerId) return;

    try {
      setAssigning(true);
      setMessage({ type: "", text: "" });
      await adminApi.assignCase(selectedCaseId, selectedOfficerId);
      setMessage({ type: "success", text: "Case successfully assigned to police officer." });
      setSelectedCaseId("");
      setSelectedOfficerId("");
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to assign case" });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <PortalPage
      eyebrow="Admin / Case assignment"
      title="Case assignment"
      subtitle="Assign authorized cases to eligible police personnel."
    >
      {message.text && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold ${
            message.type === "success"
              ? "bg-teal-50 text-teal-800 border border-teal-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        {/* Unassigned cases list */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-950">Cases waiting for assignment</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              {unassignedCases.length} pending
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={32} className="animate-spin text-teal-700" />
            </div>
          ) : unassignedCases.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
              {unassignedCases.map((c) => {
                const caseId = c._id || c.id;
                const caseNum = c.caseNumber || c.trackingId || caseId?.slice(-6);
                const isSelected = selectedCaseId === caseId;
                return (
                  <div
                    key={caseId}
                    onClick={() => setSelectedCaseId(caseId)}
                    className={`cursor-pointer rounded-2xl p-4 transition ${
                      isSelected ? "bg-teal-50/70 border border-teal-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{caseNum}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 uppercase">
                        {c.category}
                      </span>
                    </div>
                    <h4 className="mt-1 font-bold text-slate-800 text-sm">{c.title}</h4>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {c.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                      <span>{c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : "Recent"}</span>
                      {c.location?.city && <span>· {c.location.city}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-teal-600" />
              <p className="mt-3 font-bold text-slate-700">All cases assigned</p>
              <p className="mt-1 text-sm text-slate-500">There are currently no unassigned crime reports.</p>
            </div>
          )}
        </div>

        {/* Assignment Controls */}
        <form onSubmit={handleAssign} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm h-fit">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <UserCog size={20} />
            </span>
            <h2 className="font-extrabold text-slate-950">Assignment controls</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select a case and choose an eligible officer for investigation.
          </p>

          <label className="mt-6 grid gap-2 text-sm font-semibold">
            Select Case
            <select
              required
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500"
            >
              <option value="">Choose a case...</option>
              {unassignedCases.map((c) => {
                const caseId = c._id || c.id;
                const caseNum = c.caseNumber || c.trackingId || caseId?.slice(-6);
                return (
                  <option key={caseId} value={caseId}>
                    {caseNum} · {c.title || c.category}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="mt-5 grid gap-2 text-sm font-semibold">
            Assign to Officer
            <select
              required
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-teal-500"
            >
              <option value="">Choose an officer...</option>
              {officers.map((o) => {
                const officerId = o._id || o.id;
                const badge = o.profile?.badgeNumber || o.badgeNumber || "No Badge";
                const station = o.profile?.station || "General";
                return (
                  <option key={officerId} value={officerId}>
                    {o.fullName || o.name} ({badge} · {station})
                  </option>
                );
              })}
            </select>
          </label>

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={assigning || !selectedCaseId || !selectedOfficerId}
          >
            {assigning ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Assigning officer...
              </>
            ) : (
              <>
                Assign case <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>
      </div>
    </PortalPage>
  );
}
