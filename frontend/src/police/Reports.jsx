import { useState, useEffect } from "react";
import { FileText, Download, Loader2, AlertCircle, Calendar, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { policeApi } from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        const res = await policeApi.exportReports();
        if (isMounted && res.data) {
          const list = res.data.reports || (Array.isArray(res.data) ? res.data : []);
          setReports(list);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load operational reports");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => { isMounted = false; };
  }, []);

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) return;

    const headers = ["Case Number", "Title", "Category", "Status", "Date", "City", "State"];
    const rows = reports.map((r) => [
      `"${r.caseNumber || r.trackingId || r._id || ""}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${r.category || ""}"`,
      `"${r.status || ""}"`,
      `"${r.incidentDate ? new Date(r.incidentDate).toISOString() : ""}"`,
      `"${r.location?.city || ""}"`,
      `"${r.location?.state || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civic_shield_police_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalPage eyebrow="Police / Reports" title="Reports" subtitle="Generate and review authorized operational reports.">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          Showing {reports.length} report record(s)
        </p>
        <Button variant="outline" onClick={handleExportCSV} disabled={reports.length === 0 || loading}>
          <Download size={17} /> Export CSV
        </Button>
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
                <th className="px-6 py-4">Location</th>
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
                  <td className="px-6 py-4 text-slate-500">
                    {report.location?.city ? `${report.location.city}, ${report.location.state || ""}` : "Not recorded"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : "Recent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyCard
          title="No report data"
          text="There are no operational reports currently stored in the system."
          action={<FileText className="mx-auto mt-5 text-slate-300" />}
        />
      )}
    </PortalPage>
  );
}
