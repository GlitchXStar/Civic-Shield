import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, ArrowRight, Loader2, AlertCircle, Calendar, MapPin } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { policeApi } from "../services/api";

export default function AssignedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadCases() {
      try {
        setLoading(true);
        const res = await policeApi.getAssignedCases();
        if (isMounted && res.data) {
          const list = res.data.cases || (Array.isArray(res.data) ? res.data : []);
          setCases(list);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load assigned cases");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCases();
    return () => { isMounted = false; };
  }, []);

  return (
    <PortalPage
      eyebrow="Police / Assigned cases"
      title="Assigned cases"
      subtitle="Open an assigned case to review details, investigation activity and evidence."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-700" />
        </div>
      ) : cases.length > 0 ? (
        <div className="grid gap-4">
          {cases.map((c) => {
            const caseId = c._id || c.id;
            const caseNum = c.caseNumber || c.trackingId || caseId?.slice(-6);
            return (
              <div
                key={caseId}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-slate-900">{caseNum}</span>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 uppercase">
                        {c.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                        {c.status?.replace('_', ' ').toLowerCase() || 'assigned'}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{c.title || `${c.category} Case`}</h3>
                    <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {c.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : "Recent"}
                      </span>
                      {c.location?.city && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {c.location.city}, {c.location.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:self-center">
                    <Link
                      to={`/police/cases/${caseId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100"
                    >
                      Open case <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyCard
          title="No assigned cases"
          text="No cases are currently assigned to your badge."
          action={
            <Link to="/police/new-reports" className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline">
              Browse new reports →
            </Link>
          }
        />
      )}
    </PortalPage>
  );
}
