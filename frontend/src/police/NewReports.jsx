import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Inbox, Loader2, AlertCircle, Calendar, MapPin, ArrowRight } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { policeApi } from "../services/api";

export default function NewReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        const res = await policeApi.getNewReports();
        if (isMounted && res.data) {
          const list = res.data.reports || (Array.isArray(res.data) ? res.data : []);
          setReports(list);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load incoming reports");
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
    if (priorityFilter !== "All priorities" && r.priority) {
      return r.priority?.toLowerCase() === priorityFilter.toLowerCase();
    }
    return true;
  });

  return (
    <PortalPage
      eyebrow="Police / New reports"
      title="New reports"
      subtitle="Review reports available to authorized police personnel."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incoming reports..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-500"
        >
          <option>All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
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
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 uppercase">
                        {report.category}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 capitalize">
                        {report.status?.replace('_', ' ').toLowerCase() || 'submitted'}
                      </span>
                      {report.priority && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 uppercase">
                          {report.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{report.title}</h3>
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
                      to={`/police/cases/${reportId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100"
                    >
                      Review report <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyCard
          title="No new reports"
          text="There are no pending incoming reports to review right now."
          action={<Inbox className="mx-auto mt-5 text-slate-300" />}
        />
      )}
    </PortalPage>
  );
}
