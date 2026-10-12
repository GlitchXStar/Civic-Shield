import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Upload, Paperclip, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Download, FileText } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { evidenceApi } from "../services/api";

export default function Evidence() {
  const { id } = useParams();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEvidence = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await evidenceApi.getCaseEvidence(id);
      if (res.data) {
        const list = res.data.evidence || (Array.isArray(res.data) ? res.data : []);
        setEvidenceList(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load evidence records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadEvidence();
  }, [id]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      await evidenceApi.uploadEvidence(id, files, "Evidence file uploaded by police officer");
      setSuccess(`${files.length} evidence file(s) uploaded successfully.`);
      loadEvidence();
    } catch (err) {
      setError(err.message || "Failed to upload evidence files");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <PortalPage eyebrow="Police / Evidence" title="Evidence vault" subtitle={`Case reference: ${id}`}>
      <Link to={`/police/cases/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:underline">
        <ArrowLeft size={16} /> Back to case details
      </Link>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-sm font-semibold text-teal-800">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        {/* Evidence List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-950">Evidence Records</h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-teal-700" />
            </div>
          ) : evidenceList.length > 0 ? (
            <div className="mt-6 divide-y divide-slate-100">
              {evidenceList.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <div key={itemId} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                        <Paperclip size={18} />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs">
                          {item.originalName || item.fileName || "Evidence Item"}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {item.fileSize ? (item.fileSize / 1024).toFixed(1) + " KB · " : ""}
                          {item.mimeType || item.fileType || ""} ·{" "}
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.fileUrl || `/api/evidence/${itemId}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50"
                      title="Download file"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyCard
              title="No evidence records yet"
              text="No files have been attached to this case. Upload evidence using the dropzone."
            />
          )}
        </div>

        {/* Upload Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm h-fit">
          <label className="grid min-h-64 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:border-teal-300">
            <div>
              {uploading ? (
                <Loader2 className="mx-auto text-teal-700 animate-spin" size={32} />
              ) : (
                <Upload className="mx-auto text-teal-700" size={32} />
              )}
              <p className="mt-4 font-bold text-slate-800">
                {uploading ? "Uploading files..." : "Upload evidence files"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Supports images, documents, audio and video up to 10MB each.
              </p>
              <span className="mt-4 inline-block rounded-xl bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800">
                Browse files
              </span>
              <input
                type="file"
                multiple
                disabled={uploading}
                onChange={handleFileUpload}
                className="sr-only"
              />
            </div>
          </label>
        </div>
      </div>
    </PortalPage>
  );
}
