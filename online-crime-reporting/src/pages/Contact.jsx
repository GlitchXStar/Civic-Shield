import { Mail, MessageSquare, MapPin } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Contact</p>
          <h1 className="mt-3 text-5xl font-extrabold tracking-[-0.04em] text-slate-950">How can we help?</h1>
          <p className="mt-5 leading-7 text-slate-500">Use this interface for general platform enquiries. Do not submit emergency information through a general contact form.</p>
          <div className="mt-8 grid gap-4">
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"><Mail className="text-teal-700" /><div><p className="font-bold">Support</p><p className="text-sm text-slate-500">Use your organization's official support address.</p></div></div>
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"><MapPin className="text-teal-700" /><div><p className="font-bold">Local jurisdiction</p><p className="text-sm text-slate-500">For police matters, contact the responsible local authority.</p></div></div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">
          <div className="flex items-center gap-3"><MessageSquare className="text-teal-700" /><h2 className="text-xl font-extrabold">Send a message</h2></div>
          {sent && <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-800">Your message form is ready to connect to a backend endpoint.</div>}
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">Name<input required className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>
            <label className="grid gap-2 text-sm font-semibold">Message<textarea required rows="6" className="rounded-xl border border-slate-200 p-4 outline-none focus:border-teal-500" /></label>
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
