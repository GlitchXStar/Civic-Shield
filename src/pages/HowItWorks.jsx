import { ArrowRight, FileText, ShieldCheck, Search, BellRing } from "lucide-react";

const steps = [
  ["01", FileText, "Create an account", "Register as a citizen and provide the required account information."],
  ["02", ShieldCheck, "Submit your report", "Use the guided form to describe the incident and attach supporting files when appropriate."],
  ["03", Search, "Case review", "Authorized police personnel can review and process reports through their dedicated workspace."],
  ["04", BellRing, "Follow updates", "Use your citizen portal to view available case status and notifications."],
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">How it works</p>
        <h1 className="mt-3 text-5xl font-extrabold tracking-[-0.04em] text-slate-950">A clear path from report to follow-up.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-500">The frontend is organized around the reporting journey while keeping citizen, police and administrative actions separate.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {steps.map(([number, Icon, title, text]) => (
          <article key={number} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-teal-700">{number}</span>
              <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={20} /></span>
            </div>
            <h2 className="mt-8 text-xl font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 leading-7 text-slate-500">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-3xl bg-slate-950 p-7 text-white">
        <p className="text-sm font-bold">Important</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Online reporting is not a substitute for immediate emergency assistance. For an emergency or immediate danger, use the official emergency service available in your jurisdiction.</p>
      </div>
    </div>
  );
}
