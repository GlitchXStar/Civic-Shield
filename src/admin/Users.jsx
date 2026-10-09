import { Users as UsersIcon, Search, UserPlus } from "lucide-react";

export default function Users() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users icon example (was <Users /> before) */}
      <div className="flex items-center gap-2 text-gray-600">
        <UsersIcon size={20} />
        <span>Total users list will appear here</span>
      </div>
    </div>
  );
}