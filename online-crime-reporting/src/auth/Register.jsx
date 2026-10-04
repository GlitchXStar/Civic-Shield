import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../components/ui/Button";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-teal-50 to-white px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Citizen registration</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">The form is ready to connect to your real authentication service.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">
          {submitted && <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Registration API is not connected yet. No account has been created.</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" required />
            <Field label="Last name" required />
            <Field label="Email" type="email" required />
            <Field label="Phone number" type="tel" required />
            <Field label="Password" type="password" required />
            <Field label="Confirm password" type="password" required />
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm text-slate-600"><input required type="checkbox" className="mt-1" /> I agree to the platform terms and understand that false information may have legal consequences.</label>
          <Button type="submit" size="lg" className="mt-6 w-full">Create account</Button>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-teal-700">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type = "text", required }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input required={required} type={type} className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>;
}
