import { useState, useEffect } from "react";
import { Users as UsersIcon, Search, UserPlus, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { PortalPage, EmptyCard } from "../citizen/Dashboard";
import Button from "../components/ui/Button";
import { adminApi } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form for Add User
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CITIZEN",
    badgeNumber: "",
    station: "",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: "", text: "" });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.getUsers({ search });
      if (res.data) {
        const list = res.data.data || (Array.isArray(res.data) ? res.data : []);
        setUsers(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateMsg({ type: "", text: "" });
      await adminApi.createUser(newUser);
      setCreateMsg({ type: "success", text: "User created successfully." });
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "CITIZEN",
        badgeNumber: "",
        station: "",
      });
      loadUsers();
      setTimeout(() => {
        setShowModal(false);
        setCreateMsg({ type: "", text: "" });
      }, 1200);
    } catch (err) {
      setCreateMsg({ type: "error", text: err.message || "Failed to create user" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <PortalPage
      eyebrow="Admin / Users"
      title="User directory"
      subtitle="Manage registered citizens and provision personnel."
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:border-teal-500"
          />
        </div>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Add User
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
      ) : users.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id || u.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {u.fullName || u.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500">{u.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyCard
          title="No users found"
          text={search ? "No users matched your search." : "No registered users in the database."}
        />
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">Create New User</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {createMsg.text && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                  createMsg.type === "success"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {createMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {createMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                Full Name *
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Email *
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Phone
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Password *
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Min 8 characters"
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Role *
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-teal-500"
                  >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="POLICE">POLICE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
              </div>

              {newUser.role === "POLICE" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                    Badge Number *
                    <input
                      required
                      type="text"
                      value={newUser.badgeNumber}
                      onChange={(e) => setNewUser({ ...newUser, badgeNumber: e.target.value })}
                      placeholder="e.g. MH-POL-108"
                      className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                    Station *
                    <input
                      required
                      type="text"
                      value={newUser.station}
                      onChange={(e) => setNewUser({ ...newUser, station: e.target.value })}
                      placeholder="e.g. Andheri East"
                      className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"
                    />
                  </label>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalPage>
  );
}