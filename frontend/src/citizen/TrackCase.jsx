import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleDot, FileText, MessageSquare, Paperclip, Loader2, AlertCircle, Calendar, MapPin, Download } from "lucide-react";
import { PortalPage } from "./Dashboard";
import { citizenApi, evidenceApi } from "../services/api";

export default function TrackCase() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadCaseData() {
      try {
        setLoading(true);
        setError("");

        // Run queries in parallel
        const [reportRes, timelineRes, evidenceRes] = await Promise.allSettled([
          citizenApi.getReportDetails(id),
          citizenApi.getReportTimeline(id),
          evidenceApi.getCaseEvidence(id),
        ]);

        if (isMounted) {
          if (reportRes.status === "fulfilled" && reportRes.value.data) {
            setReport(reportRes.value.data.report || reportRes.value.data);
          } else if (reportRes.status === "rejected") {
            setError(reportRes.reason?.message || "Failed to load report details.");
          }

          if (timelineRes.status === "fulfilled" && timelineRes.value.data) {
            const tl = timelineRes.value.data.timeline || (Array.isArray(timelineRes.value.data) ? timelineRes.value.data : []);
            setTimeline(tl);
          }

          if (evidenceRes.status === "fulfilled" && evidenceRes.value.data) {
            const ev = evidenceRes.value.data.evidence || (Array.isArray(evidenceRes.value.data) ? evidenceRes.value.data : []);
            setEvidenceList(ev);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to retrieve case information");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      loadCaseData();
    }
    return () => { isMounted = false; };
  }, [id]);

  const caseNumber = report?.caseNumber || report?.trackingId || id;

  return (
    <PortalPage eyebrow="Citizen / Track case" title="Track case" subtitle={`Case reference: ${caseNumber}`}>
      <Link to="/citizen/my-reports" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline">
        <ArrowLeft size={16} /> Back to reports
      </Link>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex h-48 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-700" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          {/* Timeline Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-950">Case timeline & history</h2>
            {timeline.length > 0 ? (
              <div className="relative mt-7 space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timeline.map((event, index) => (
                  <div key={event._id || index} className="relative">
                    <span className="absolute -left-[27px] top-1 grid size-5 place-items-center rounded-full bg-teal-600 ring-4 ring-white">
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900">
                          {event.newStatus || event.status || "Status Updated"}
                        </span>
                        {event.previousStatus && (
                          <span className="text-xs text-slate-400">
                            (was: {event.previousStatus})
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-teal-700">
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : "Date recorded"}
                      </p>
                      {event.reason && (
                        <p className="mt-1.5 text-sm leading-6 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {event.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <CircleDot className="mx-auto text-teal-700" />
                <p className="mt-3 font-bold text-slate-700">Report registered</p>
                <p className="mt-1 text-sm text-slate-500">
                  Your report has been received and is waiting for officer assignment. Further timeline milestones will appear as updates occur.
                </p>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <FileText size={19} className="text-teal-700" />
              <p className="mt-3 font-bold text-slate-900">Report details</p>
              {report ? (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p><strong className="text-slate-800">Title:</strong> {report.title}</p>
                  <p><strong className="text-slate-800">Category:</strong> {report.category}</p>
                  <p><strong className="text-slate-800">Current Status:</strong> <span className="capitalize font-semibold text-teal-700">{report.status?.replace('_', ' ').toLowerCase()}</span></p>
                  <p><strong className="text-slate-800">Incident Date:</strong> {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString() : 'N/A'}</p>
                  {report.location?.address && <p><strong className="text-slate-800">Address:</strong> {report.location.address}</p>}
                  <p className="mt-2 text-xs leading-5 text-slate-500 border-t border-slate-100 pt-2">{report.description}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No report data found.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Paperclip size={19} className="text-teal-700" />
              <p className="mt-3 font-bold text-slate-900">Evidence files ({evidenceList.length})</p>
              {evidenceList.length > 0 ? (
                <div className="mt-3 space-y-2 divide-y divide-slate-100 text-xs">
                  {evidenceList.map((item) => (
                    <div key={item._id || item.id} className="pt-2 flex items-center justify-between">
                      <div className="truncate max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{item.originalName || item.fileName || "File"}</p>
                        <p className="text-slate-400">{(item.fileSize ? (item.fileSize / 1024).toFixed(1) + " KB" : "")}</p>
                      </div>
                      <a
                        href={item.fileUrl || `/api/evidence/${item._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-teal-50 p-1.5 text-teal-700 hover:bg-teal-100"
                        title="Download file"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No evidence attached to this case.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalPage>
  );
}
