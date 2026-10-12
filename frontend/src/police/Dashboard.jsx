import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Inbox, BriefcaseBusiness, FileText, MapPin, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { PortalPage, Stat, EmptyCard } from "../citizen/Dashboard";
import CrimeMap from "../components/CrimeMap";
import { policeApi } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    newReports: 0,
    assignedCases: 0,
    reports: [],
    markers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoading(true);
        const res = await policeApi.getDashboard();
        if (isMounted && res.data) {
          setStats({
            newReports: res.data.newReports ?? 0,
            assignedCases: res.data.assignedCases ?? 0,
            reports: res.data.reports || [],
            markers: res.data.markers || [],
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load police dashboard metrics");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <PortalPage
      eyebrow="Police / Dashboard"
      title="Police workspace"
      subtitle="Review incoming reports, manage assigned cases and access investigation tools."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Inbox} label="New incoming reports" value={loading ? "..." : stats.newReports} />
        <Stat icon={BriefcaseBusiness} label="Your assigned cases" value={loading ? "..." : stats.assignedCases} />
        <Stat icon={FileText} label="Active reports" value={loading ? "..." : (stats.reports.length)} />
      </div>

      <div className="mt-6">
        {stats.reports.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-950">Active assigned cases</h2>
              <Link to="/police/assigned-cases" className="text-sm font-bold text-teal-700 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {stats.reports.map((report) => {
                const reportId = report._id || report.id;
                const caseNum = report.caseNumber || report.trackingId || reportId?.slice(-6);
                return (
                  <div key={reportId} className="flex items-center justify-between py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{caseNum}</span>
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 capitalize">
                          {report.status?.replace('_', ' ').toLowerCase() || 'assigned'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 font-medium">
                        {report.title || report.category} · {report.location?.city || "Location noted"}
                      </p>
                    </div>
                    <Link
                      to={`/police/cases/${reportId}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline"
                    >
                      Case details <ArrowRight size={15} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyCard
            title="Incoming work"
            text="No cases are currently assigned to you. Check new reports or case assignments."
            action={
              <Link to="/police/new-reports" className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline">
                Check new reports →
              </Link>
            }
          />
        )}
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <MapPin size={19} />
          </span>
          <div>
            <h2 className="font-extrabold text-slate-950">Case locations</h2>
            <p className="text-sm text-slate-500">
              {stats.markers.length > 0 ? "OpenStreetMap view for operational situational awareness." : "No assigned cases with geo-coordinates."}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CrimeMap markers={stats.markers} height={360} />
        </div>
      </section>
    </PortalPage>
  );
}
