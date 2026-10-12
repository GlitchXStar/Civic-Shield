import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Loader2, ArrowRight, AlertCircle, Calendar, MapPin } from "lucide-react";
import { PortalPage, EmptyCard } from "./Dashboard";
import { citizenApi } from "../services/api";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        const res = await citizenApi.getMyReports();
        if (isMounted) {
          const list = res.data?.reports || (Array.isArray(res.data) ? res.data : []);
          setReports(list);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load reports");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => { isMounted = false; };
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "All statuses") return true;
    if (statusFilter === "Submitted") return r.status === "SUBMITTED" || r.status === "PENDING";
    if (statusFilter === "Under review") return r.status === "ASSIGNED" || r.status === "UNDER_INVESTIGATION";
    if (statusFilter === "Closed") return r.status === "RESOLVED" || r.status === "CLOSED" || r.status === "DISMISSED";
    return true;
  });

  return (
    <PortalPage eyebrow="Citizen / My reports" title="My reports" subtitle="View submitted reports and open a case to see available status information.">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by title, case number, or category..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-500"
        >
          <option>All statuses</option>
          <option>Submitted</option>
          <option>Under review</option>
          <option>Closed</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-700" />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid gap-4">
          {filteredReports.map((report) => {
            const reportId = report._id || report.id;
            const caseNum = report.caseNumber || report.trackingId || reportId?.slice(-6);
            return (
              <div
                key={reportId}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-slate-900">{caseNum}</span>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 uppercase tracking-wide">
                        {report.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                        {report.status?.replace('_', ' ').toLowerCase() || 'submitted'}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{report.title || "Report Incident"}</h3>
                    <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {report.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : "Recent"}
                      </span>
                      {report.location?.city && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {report.location.city}, {report.location.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:self-center">
                    <Link
                      to={`/citizen/track-case/${reportId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
                    >
                      Track case <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyCard
          title="No reports found"
          text={
            search || statusFilter !== "All statuses"
              ? "No reports match your search criteria. Try clearing filters."
              : "You haven't submitted any crime reports yet."
          }
          action={
            <Link to="/citizen/report-crime" className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline">
              Report a crime →
            </Link>
          }
        />
      )}
    </PortalPage>
  );
}
