import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Shield, FileText, BarChart3, MapPin, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";
import CrimeMap from "../components/CrimeMap";
import { adminApi } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    officers: 0,
    reports: 0,
    activeCases: 0,
    resolvedCases: 0,
    recentReports: [],
    markers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await adminApi.getDashboard();
        if (isMounted && res.data) {
          setStats({
            users: res.data.users ?? 0,
            officers: res.data.officers ?? 0,
            reports: res.data.reports ?? 0,
            activeCases: res.data.stats?.activeCases ?? 0,
            resolvedCases: res.data.stats?.resolvedCases ?? 0,
            recentReports: res.data.recentReports || [],
            markers: res.data.markers || [],
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load administration dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => { isMounted = false; };
  }, []);

  return (
    <PortalPage
      eyebrow="Admin / SHO"
      title="Administration dashboard"
      subtitle="Manage users, police officers, reports, assignments, analytics and audit activity."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Registered Citizens" value={loading ? "..." : stats.users} />
        <Stat icon={Shield} label="Police Officers" value={loading ? "..." : stats.officers} />
        <Stat icon={FileText} label="Total Crime Reports" value={loading ? "..." : stats.reports} />
        <Stat icon={BarChart3} label="Active Investigations" value={loading ? "..." : stats.activeCases} />
      </div>

      <div className="mt-6">
        {stats.recentReports.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-950">System-wide recent reports</h2>
              <Link to="/admin/reports" className="text-sm font-bold text-teal-700 hover:underline">
                View all reports →
              </Link>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {stats.recentReports.map((report) => {
                const reportId = report._id || report.id;
                const caseNum = report.caseNumber || report.trackingId || reportId?.slice(-6);
                return (
                  <div key={reportId} className="flex items-center justify-between py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{caseNum}</span>
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 uppercase">
                          {report.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 capitalize">
                          {report.status?.replace('_', ' ').toLowerCase() || 'submitted'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 font-medium">
                        {report.title} · {report.location?.city || "Registered location"}
                      </p>
                    </div>
                    <Link to="/admin/reports" className="text-sm font-bold text-teal-700 hover:underline">
                      Manage →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyCard
            title="System overview"
            text="No reports have been recorded in the system yet."
          />
        )}
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <MapPin size={19} />
          </span>
          <div>
            <h2 className="font-extrabold text-slate-950">Report distribution</h2>
            <p className="text-sm text-slate-500">
              {stats.markers.length > 0 ? "OpenStreetMap geographic distribution of crime reports." : "No reports with geo-coordinates."}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CrimeMap markers={stats.markers} height={380} />
        </div>
      </section>
    </PortalPage>
  );
}
