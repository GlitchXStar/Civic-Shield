import { useState, useEffect } from "react";
import { FileText, Search, Loader2, AlertCircle, Calendar, User, Shield } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { adminApi } from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.getAllReports({ search, status: statusFilter });
      if (res.data) {
        const list = res.data.data || (Array.isArray(res.data) ? res.data : []);
        setReports(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [search, statusFilter]);

  return (
    <PortalPage
      eyebrow="Admin / Reports"
      title="Reports management"
      subtitle="Review report records across the system according to your authorization."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by title or case number..."
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
          <option>Assigned</option>
          <option>Under investigation</option>
          <option>Resolved</option>
          <option>Closed</option>
          <option>Dismissed</option>
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
      ) : reports.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Case #</th>
                <th className="px-6 py-4">Title / Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Assigned Officer</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report._id || report.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-black text-slate-900">
                    {report.caseNumber || report.trackingId || report._id?.slice(-6)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{report.title}</p>
                    <span className="text-xs text-slate-400">{report.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 capitalize">
                      {report.status?.replace('_', ' ').toLowerCase() || 'submitted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {report.submittedBy?.fullName || report.submittedBy?.name || "Citizen"}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                    {report.assignedTo ? (
                      <span className="flex items-center gap-1 text-teal-800">
                        <Shield size={13} /> {report.assignedTo.fullName || report.assignedTo.name}
                      </span>
                    ) : (
                      <span className="text-amber-700">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : "Recent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyCard
          title="No reports available"
          text={search ? "No reports match your search criteria." : "There are no reports recorded in the system."}
          action={<FileText className="mx-auto mt-5 text-slate-300" />}
        />
      )}
    </PortalPage>
  );
}
