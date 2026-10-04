import { Link } from "react-router-dom";
import { AlertTriangle, Phone, MapPin, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";

export default function Emergency() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300"><AlertTriangle size={27} /></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-red-300">Emergency information</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">If someone is in immediate danger, get emergency help first.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-slate-300">Do not wait for an online report to receive an emergency response. Contact your local official emergency service or police control room.</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          [Phone, "Emergency service", "Use the official emergency number for your country or jurisdiction."],
          [MapPin, "Nearest police station", "For non-immediate assistance, contact the police station responsible for the incident location."],
          [AlertTriangle, "Online report", "Use this platform for structured reporting and follow-up when an online report is appropriate."],
        ].map(([Icon, title, text]) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-600"><Icon size={21} /></span>
            <h2 className="mt-5 font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-teal-100 bg-teal-50 p-7">
        <h2 className="text-xl font-extrabold text-slate-950">Need to submit a non-emergency report?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Create an account and use the guided crime-reporting form.</p>
        <Link to="/register" className="mt-5 inline-block"><Button>Create an account <ArrowRight size={17} /></Button></Link>
      </div>
    </div>
  );
}
