import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, FileText, SearchCheck, LockKeyhole, Siren, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";

const cards = [
  { icon: FileText, title: "Submit a report", text: "Provide incident details through a structured, guided reporting flow." },
  { icon: SearchCheck, title: "Track your case", text: "Follow the status of a submitted report from your citizen portal." },
  { icon: LockKeyhole, title: "Protected access", text: "Keep citizen, police and administration workspaces separated by role." },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#087f76] via-[#0aa08f] to-[#d8f8f0]">
        <div className="absolute inset-0 opacity-20 app-grid" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                <ShieldCheck size={14} /> Digital public safety
              </div>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Report safely.<br />Stay informed.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                A modern online crime reporting interface designed to make citizen reporting clearer, easier to follow and ready for secure backend integration.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/citizen/report-crime">
                  <Button size="lg" className="bg-white text-[#075f58] hover:bg-slate-50">Report a crime <ArrowRight size={17} /></Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="secondary" className="bg-white/15 text-white hover:bg-white/25">How it works</Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-white/85">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Guided forms</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Case tracking</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Role-based workspaces</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/40 bg-white/20 p-3 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[1.5rem] bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Citizen portal</p>
                      <p className="mt-1 text-lg font-extrabold text-slate-950">Your reporting workspace</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><ShieldCheck size={20} /></span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {cards.map(({ icon: Icon, title, text }) => (
                      <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <span className="grid size-9 place-items-center rounded-xl bg-[#dff8f2] text-[#087f76]"><Icon size={18} /></span>
                        <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#e7fbf6] to-white p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-white text-teal-700 shadow-sm"><Siren size={18} /></span>
                      <div>
                        <p className="text-sm font-bold text-slate-950">Emergency situations</p>
                        <p className="text-xs text-slate-500">Use official emergency services when immediate help is needed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">One connected experience</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-slate-950">Everything you need to report and follow up.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={21} /></span>
              <h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#e6faf5]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Built around clarity</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-slate-950">Less friction. Better information.</h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">The interface separates citizen, police and administration workflows so each role can focus on the actions that belong to it.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Citizen reporting", "Police case handling", "Administration", "Secure backend ready"].map((item) => (
                <div key={item} className="rounded-2xl border border-white bg-white p-5">
                  <CheckCircle2 className="text-teal-700" size={19} />
                  <p className="mt-3 font-bold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
