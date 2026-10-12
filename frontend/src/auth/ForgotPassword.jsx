import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-teal-50 to-white px-5 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">
          <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Mail /></span>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-950">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enter the email address associated with your account.</p>
          {sent && <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Password reset API is not connected yet. No email has been sent.</div>}
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-6 grid gap-5">
            <input required type="email" placeholder="you@example.com" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" />
            <Button type="submit" size="lg">Request reset</Button>
          </form>
          <Link to="/login" className="mt-5 block text-center text-sm font-bold text-teal-700">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
