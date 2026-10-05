import { UserRound, Save } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { PortalPage } from "./Dashboard";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || '';
  const lastName = user?.name?.split(' ').slice(1).join(' ') || '';

  return <PortalPage eyebrow="Citizen / Profile" title="Profile" subtitle="Manage the personal information associated with your account.">
    <form onSubmit={(e) => {e.preventDefault(); setSaved(true)}} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><UserRound size={19}/></span>
        <h2 className="font-extrabold">Personal information</h2>
      </div>
      {saved && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Profile API is not connected. No information was saved.</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="First name" defaultValue={firstName} />
        <Field label="Last name" defaultValue={lastName} />
        <Field label="Email" type="email" defaultValue={user?.email || ''} readOnly />
        <Field label="Phone" type="tel" defaultValue={user?.phone || ''} />
        <label className="md:col-span-2 grid gap-2 text-sm font-semibold">Address
          <textarea rows="3" className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500"/>
        </label>
      </div>
      <Button type="submit" className="mt-6"><Save size={17}/> Save changes</Button>
    </form>
  </PortalPage>;
}
function Field({label, type="text", defaultValue, readOnly}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input type={type} defaultValue={defaultValue} readOnly={readOnly} className={`h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500 ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
    </label>
  );
}
