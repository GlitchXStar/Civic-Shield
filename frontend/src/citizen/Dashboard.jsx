import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock3, CheckCircle2, ArrowRight, FilePlus2, MapPin, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import CrimeMap from "../components/CrimeMap";
import { citizenApi } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    activeCases: 0,
    resolvedCases: 0,
    recentReports: [],
    markers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await citizenApi.getDashboard();
        if (isMounted && res.data) {
          setStats({
            totalReports: res.data.totalReports ?? 0,
            activeCases: res.data.activeCases ?? 0,
            resolvedCases: res.data.resolvedCases ?? 0,
            recentReports: res.data.recentReports || [],
            markers: res.data.markers || [],
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load dashboard metrics");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <PortalPage eyebrow="Citizen dashboard" title="Your reporting workspace" subtitle="Manage reports, track case progress and keep your account information up to date.">
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FileText} label="Total reports" value={loading ? "..." : stats.totalReports} />
        <Stat icon={Clock3} label="Active cases" value={loading ? "..." : stats.activeCases} />
        <Stat icon={CheckCircle2} label="Resolved cases" value={loading ? "..." : stats.resolvedCases} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        {stats.recentReports.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-950">Recent reports</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {stats.recentReports.map((report) => (
                <div key={report._id || report.id} className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{report.caseNumber || report.trackingId || report._id?.slice(-6)}</span>
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 capitalize">
                        {report.status?.replace('_', ' ').toLowerCase() || 'submitted'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{report.category} · {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : 'Recent'}</p>
                  </div>
                  <Link to={`/citizen/track-case/${report._id || report.id}`} className="text-sm font-bold text-teal-700 hover:underline">
                    Track →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyCard 
            title="Recent reports" 
            text="No reports submitted yet. Submit a crime report to track its progress here." 
            action={
              <Link to="/citizen/report-crime" className="mt-5 inline-block text-sm font-bold text-teal-700 hover:underline">
                Submit your first report →
              </Link>
            }
          />
        )}

        <div className="rounded-3xl bg-[#087f76] p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <FilePlus2 size={24} />
            <h2 className="mt-5 text-xl font-extrabold">Ready to report?</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">Use the guided form to provide incident information and upload supporting evidence.</p>
          </div>
          <Link to="/citizen/report-crime" className="mt-6 inline-block">
            <Button variant="secondary">Report a crime <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><MapPin size={19} /></span>
          <div>
            <h2 className="font-extrabold text-slate-950">Incident map</h2>
            <p className="text-sm text-slate-500">
              {stats.markers.length > 0 ? "OpenStreetMap view of your reported incident locations." : "No reported incidents with coordinates yet."}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CrimeMap markers={stats.markers} height={340} />
        </div>
      </section>
    </PortalPage>
  );
}

export function PortalPage({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Stat({ icon: Icon, label, value = "—" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={19} /></span>
        <span className="text-2xl font-black text-slate-800">{value}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export function EmptyCard({ title, text, action }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-bold text-slate-700">No data available</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
        {action}
      </div>
    </div>
  );
}
