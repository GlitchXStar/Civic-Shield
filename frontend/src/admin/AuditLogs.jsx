import { useState, useEffect } from "react";
import { ClipboardList, Search, Loader2, AlertCircle, Clock, ShieldCheck, User } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { adminApi } from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.getAuditLogs({ search });
      if (res.data) {
        const list = res.data.data || (Array.isArray(res.data) ? res.data : []);
        setLogs(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [search]);

  return (
    <PortalPage
      eyebrow="Admin / Audit logs"
      title="System audit logs"
      subtitle="Review verified administrative and operational system events."
    >
      <div className="mb-6 relative max-w-md">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action or resource..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"
        />
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
      ) : logs.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id || log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                    {log.user?.fullName || log.user?.name || log.user?.email || "System Actor"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                    {log.details ? (typeof log.details === "object" ? JSON.stringify(log.details) : log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyCard
          title="No audit events"
          text={search ? "No events matched your search." : "No audit events logged yet."}
          action={<ClipboardList className="mx-auto mt-5 text-slate-300" />}
        />
      )}
    </PortalPage>
  );
}
