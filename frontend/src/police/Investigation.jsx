import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Plus, ArrowLeft, Loader2, AlertCircle, CheckCircle2, FileText, User } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import { policeApi } from "../services/api";

export default function Investigation() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await policeApi.getInvestigation(id);
      if (res.data) {
        const list = res.data.notes || (Array.isArray(res.data) ? res.data : []);
        setNotes(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load investigation notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadNotes();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await policeApi.addInvestigationNote(id, noteContent.trim());
      setSuccess("Investigation note recorded successfully.");
      setNoteContent("");
      loadNotes();
    } catch (err) {
      setError(err.message || "Failed to record investigation note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPage eyebrow="Police / Investigation" title="Investigation activity" subtitle={`Case reference: ${id}`}>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        {/* Notes Timeline / List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-950">Recorded Investigation Notes</h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-teal-700" />
            </div>
          ) : notes.length > 0 ? (
            <div className="mt-6 divide-y divide-slate-100">
              {notes.map((n, i) => (
                <div key={n._id || i} className="py-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User size={13} /> {n.author?.fullName || n.author?.name || "Investigating Officer"}
                    </span>
                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : "Date noted"}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {n.note || n.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No investigation entries yet"
              text="No notes recorded for this case. Use the form on the right to log findings."
            />
          )}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm h-fit">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Plus size={18} />
            </span>
            <h2 className="font-extrabold text-slate-950">Add investigation note</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Notes are audited and restricted to authorized case personnel.
          </p>

          <textarea
            required
            rows="7"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Document interview details, forensic results, suspect information or scene notes..."
            className="mt-5 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500 text-sm leading-relaxed"
          />

          <Button type="submit" className="mt-4 w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Recording note...
              </>
            ) : (
              "Save note"
            )}
          </Button>
        </form>
      </div>
    </PortalPage>
  );
}
