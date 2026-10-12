import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Loader2, AlertCircle, PieChart, CheckCircle2, ShieldAlert } from "lucide-react";
import { PortalPage, Stat } from "../citizen/Dashboard";
import { adminApi } from "../services/api";

export default function Analytics() {
  const [data, setData] = useState({
    casesByCategory: [],
    casesByStatus: [],
    totalReports: 0,
    resolvedReports: 0,
    resolutionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await adminApi.getAnalytics();
        if (isMounted && res.data) {
          setData({
            casesByCategory: res.data.casesByCategory || [],
            casesByStatus: res.data.casesByStatus || [],
            totalReports: res.data.totalReports ?? 0,
            resolvedReports: res.data.resolvedReports ?? 0,
            resolutionRate: res.data.resolutionRate ?? 0,
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load system analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAnalytics();
    return () => { isMounted = false; };
  }, []);

  return (
    <PortalPage
      eyebrow="Admin / Analytics"
      title="System analytics"
      subtitle="System-level metrics, resolution rates and operational caseload distribution."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={BarChart3} label="Total Reports Logged" value={loading ? "..." : data.totalReports} />
        <Stat icon={CheckCircle2} label="Resolved Reports" value={loading ? "..." : data.resolvedReports} />
        <Stat icon={TrendingUp} label="System Resolution Rate" value={loading ? "..." : `${data.resolutionRate}%`} />
        <Stat icon={ShieldAlert} label="In-Progress Cases" value={loading ? "..." : Math.max(0, data.totalReports - data.resolvedReports)} />
      </div>

      {loading ? (
        <div className="mt-12 flex h-48 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-700" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Category distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <PieChart size={18} />
              </span>
              <h2 className="font-extrabold text-slate-900">Reports by Category</h2>
            </div>
            {data.casesByCategory.length > 0 ? (
              <div className="mt-6 space-y-4">
                {data.casesByCategory.map((cat) => {
                  const pct = data.totalReports > 0 ? Math.round((cat.count / data.totalReports) * 100) : 0;
                  return (
                    <div key={cat._id || "Other"}>
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{cat._id || "Other"}</span>
                        <span>{cat.count} ({pct}%)</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-600 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 text-center text-sm font-semibold text-slate-400">
                No categorical report data available.
              </div>
            )}
          </div>

          {/* Status Breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <BarChart3 size={18} />
              </span>
              <h2 className="font-extrabold text-slate-900">Cases by Status</h2>
            </div>
            {data.casesByStatus.length > 0 ? (
              <div className="mt-6 space-y-4">
                {data.casesByStatus.map((st) => {
                  const pct = data.totalReports > 0 ? Math.round((st.count / data.totalReports) * 100) : 0;
                  return (
                    <div key={st._id || "Status"}>
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span className="capitalize">{st._id?.replace('_', ' ').toLowerCase() || "Submitted"}</span>
                        <span>{st.count} ({pct}%)</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 text-center text-sm font-semibold text-slate-400">
                No status breakdown data available.
              </div>
            )}
          </div>
        </div>
      )}
    </PortalPage>
  );
}
