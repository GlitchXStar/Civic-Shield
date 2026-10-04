import { Search, UserPlus, Users as UsersIcon } from "lucide-react";

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Users
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage registered users and their access.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          <UserPlus size={17} />
          Add User
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400" />

          <input
            type="search"
            placeholder="Search users..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <UsersIcon size={25} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          No users loaded
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          User records will appear here when this frontend is connected to
          your authentication and user-management API.
        </p>
      </div>
    </div>
  );
}