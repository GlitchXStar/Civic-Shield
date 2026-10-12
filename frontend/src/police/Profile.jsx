import { useState, useEffect } from "react";
import { UserRound, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage } from "../citizen/Dashboard";
import { policeApi } from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    badgeNumber: "",
    station: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await policeApi.getProfile();
        if (isMounted && res.data) {
          const u = res.data.user || {};
          const p = res.data.profile || {};
          setProfile({
            name: u.fullName || u.name || "",
            email: u.email || "",
            badgeNumber: p.badgeNumber || u.badgeNumber || "",
            station: p.station || "",
          });
        }
      } catch (err) {
        if (isMounted) setMessage({ type: "error", text: err.message || "Failed to load officer profile" });
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      await policeApi.updateProfile({
        name: profile.name,
        station: profile.station,
      });
      setMessage({ type: "success", text: "Officer profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save profile changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPage eyebrow="Police / Profile" title="Officer profile" subtitle="Manage profile information available to your account.">
      <form onSubmit={handleSubmit} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <UserRound size={19} />
          </span>
          <h2 className="font-extrabold text-slate-900">Professional information</h2>
        </div>

        {message.text && (
          <div
            className={`mt-5 flex items-center gap-2 rounded-xl p-4 text-sm font-semibold ${
              message.type === "success"
                ? "bg-teal-50 text-teal-800 border border-teal-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="my-8 flex h-32 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-teal-700" />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Full name
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Official email
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500 outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Badge / Employee ID
                <input
                  type="text"
                  disabled
                  value={profile.badgeNumber}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500 outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Station
                <input
                  type="text"
                  value={profile.station}
                  onChange={(e) => setProfile({ ...profile, station: e.target.value })}
                  className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>
            </div>

            <Button type="submit" className="mt-6" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={17} /> Save changes
                </>
              )}
            </Button>
          </>
        )}
      </form>
    </PortalPage>
  );
}
