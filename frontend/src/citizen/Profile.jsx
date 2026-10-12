import { useState, useEffect } from "react";
import { UserRound, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";
import { PortalPage } from "./Dashboard";
import { citizenApi } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await citizenApi.getProfile();
        if (isMounted && res.data) {
          const u = res.data.user || res.data;
          const names = (u.fullName || u.name || "").split(" ");
          setProfile({
            firstName: names[0] || "",
            lastName: names.slice(1).join(" ") || "",
            email: u.email || "",
            phone: u.phone || "",
            address: typeof u.address === "string" ? u.address : (u.address?.street || u.address?.address || ""),
          });
        }
      } catch (err) {
        if (isMounted) {
          // Fallback to authUser if endpoint has issue
          if (authUser) {
            const names = (authUser.fullName || "").split(" ");
            setProfile({
              firstName: names[0] || "",
              lastName: names.slice(1).join(" ") || "",
              email: authUser.email || "",
              phone: authUser.phone || "",
              address: "",
            });
          } else {
            setMessage({ type: "error", text: err.message || "Failed to load profile" });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();
      await citizenApi.updateProfile({
        name: fullName,
        phone: profile.phone,
        address: profile.address,
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save profile changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPage eyebrow="Citizen / Profile" title="Profile" subtitle="Manage the personal information associated with your account.">
      <form onSubmit={handleSubmit} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <UserRound size={19} />
          </span>
          <h2 className="font-extrabold text-slate-900">Personal information</h2>
        </div>

        {message.text && (
          <div
            className={`mt-5 flex items-center gap-2 rounded-xl p-4 text-sm font-semibold ${
              message.type === "success" ? "bg-teal-50 text-teal-800 border border-teal-200" : "bg-rose-50 text-rose-800 border border-rose-200"
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
                First name
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Last name
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500 outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Phone
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
                />
              </label>

              <label className="md:col-span-2 grid gap-2 text-sm font-semibold">
                Address
                <textarea
                  rows="3"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500"
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
