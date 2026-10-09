import { Shield, Smartphone, KeyRound, CircleAlert, MessageCircle } from "lucide-react";

const resources = [
  [Shield, "Personal safety", "Stay aware of your surroundings, plan routes and keep trusted contacts informed when appropriate."],
  [Smartphone, "Digital safety", "Use device locks, software updates and strong account credentials. Avoid sharing sensitive information through untrusted channels."],
  [KeyRound, "Account security", "Use a unique password for your reporting account and never share authentication codes."],
  [CircleAlert, "Scam awareness", "Be cautious of requests for money, passwords, verification codes or remote access from unknown people."],
  [MessageCircle, "Preserve information", "Keep relevant messages, documents or other information that may be useful when making a report."],
];

export default function SafetyResources() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Safety resources</p>
        <h1 className="mt-3 text-5xl font-extrabold tracking-[-0.04em] text-slate-950">Practical habits for safer digital and everyday life.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-500">General information only. Follow official local guidance for your situation.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {resources.map(([Icon, title, text]) => (
          <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={20} /></span>
            <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
