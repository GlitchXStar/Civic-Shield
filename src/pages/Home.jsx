
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  SearchCheck,
  LockKeyhole,
  Siren,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock3,
  Users,
  ChevronRight,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Easy Crime Reporting",
    description:
      "Submit incident details through a guided form that makes reporting clear, organized, and convenient.",
  },
  {
    icon: SearchCheck,
    title: "Track Your Reports",
    description:
      "Sign in to review available updates and follow the progress of your submitted reports.",
  },
  {
    icon: LockKeyhole,
    title: "Role-Based Security",
    description:
      "Dedicated workspaces help citizens, police personnel, and administrators access the tools assigned to their roles.",
  },
];

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an account",
    description:
      "Register for an account and sign in to access the features available to you.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Submit a report",
    description:
      "Provide incident details and the location, along with any relevant information.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Follow case progress",
    description:
      "Check your report status and review updates when they become available.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#087f76] via-[#099889] to-[#62c9b3]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* HERO TEXT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <ShieldCheck size={17} />
              Digital Public Safety Platform
            </div>

            <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Report Safely.
              <br />
              Stay Informed.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              CrimeConnect brings online crime reporting, case tracking,
              and public safety information together in one convenient
              platform.
            </p>

            {/* MAIN BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-[#087f76] shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                Get Started
                <ArrowRight size={19} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 py-4 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                Explore How It Works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/90">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} />
                Guided reporting
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} />
                Case tracking
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} />
                Role-based access
              </span>
            </div>
          </div>

          {/* HOMEPAGE PREVIEW */}
          <div className="rounded-[2rem] border border-white/40 bg-white/20 p-2.5 shadow-2xl backdrop-blur-md sm:p-3">
            <div className="rounded-[1.5rem] bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#087f76]">
                    CRIMECONNECT
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                    Your Safety, Our Priority
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    A simpler way to access reporting and public safety
                    resources.
                  </p>
                </div>

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#087f76]">
                  <ShieldCheck size={25} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-[#087f76]">
                    <FileText size={22} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Report an Incident
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Submit incident information through a guided reporting
                    process.
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-[#087f76]">
                    <SearchCheck size={22} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Track a Report
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review available case updates after securely signing in.
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200 sm:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-100 text-[#087f76]">
                      <LockKeyhole size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Protected Workspaces
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Separate access for citizens, police personnel,
                        and administrators according to assigned roles.
                      </p>
                    </div>
                  </div>
                </article>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#e8faf5] p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#087f76] shadow-sm">
                  <Siren size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">
                    Emergency Assistance
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Contact official emergency services if someone is in
                    immediate danger.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#087f76]">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-bold">Secure Access</h3>
              <p className="mt-1 text-sm text-slate-500">
                Role-based workspaces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#087f76]">
              <Clock3 size={23} />
            </div>

            <div>
              <h3 className="font-bold">Convenient Reporting</h3>
              <p className="mt-1 text-sm text-slate-500">
                Structured reporting workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-[#087f76]">
              <MapPin size={23} />
            </div>

            <div>
              <h3 className="font-bold">Location-Aware Reports</h3>
              <p className="mt-1 text-sm text-slate-500">
                Capture incident locations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="scroll-mt-20 bg-slate-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#087f76]">
              Platform Features
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Everything You Need in One Place
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Explore tools designed to organize reporting, case follow-up,
              and secure access.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-[#087f76]">
                  <Icon size={26} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#087f76]">
              How It Works
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Three Simple Steps
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Follow a clear process to create an account, submit incident
              details, and review available case updates.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="rounded-3xl border border-slate-200 p-7">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold text-teal-200">
                    {number}
                  </span>

                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-[#087f76]">
                    <Icon size={23} />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 font-bold text-[#087f76] hover:text-teal-900"
            >
              Create Your Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ROLE-BASED ACCESS */}
      <section className="bg-[#e8faf5] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#087f76]">
              Responsible Access
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              The Right Tools for Every Role
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              CrimeConnect provides separate workflows for citizens,
              police personnel, and administrators. Each account should
              access only the features permitted by its assigned role.
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#087f76] px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Sign In to Continue
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white bg-white p-6 shadow-sm">
              <Users size={25} className="text-[#087f76]" />

              <h3 className="mt-4 font-bold">Citizen Workspace</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Submit reports and check available case updates.
              </p>
            </article>

            <article className="rounded-2xl border border-white bg-white p-6 shadow-sm">
              <ShieldCheck size={25} className="text-[#087f76]" />

              <h3 className="mt-4 font-bold">Police Workspace</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Access authorized case review and management features.
              </p>
            </article>

            <article className="rounded-2xl border border-white bg-white p-6 shadow-sm sm:col-span-2">
              <LockKeyhole size={25} className="text-[#087f76]" />

              <h3 className="mt-4 font-bold">Administration Workspace</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage permitted users and administrative operations.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* REGISTRATION CALL TO ACTION */}
      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-br from-[#087f76] to-[#0aa08f] px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white">
            <ShieldCheck size={30} />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Take the Next Step Toward Safer Communities
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/90">
            Create an account to get started, or sign in if you already
            have one.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#087f76] transition hover:bg-slate-100"
            >
              Create Account
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#087f76] text-white">
              <ShieldCheck size={23} />
            </span>

            <span>
              <span className="block font-extrabold text-slate-950">
                CrimeConnect
              </span>

              <span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Public Safety Platform
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <a href="#features" className="transition hover:text-teal-700">
              Features
            </a>

            <a href="#how-it-works" className="transition hover:text-teal-700">
              How It Works
            </a>

            <Link to="/login" className="transition hover:text-teal-700">
              Sign In
            </Link>

            <Link to="/register" className="transition hover:text-teal-700">
              Register
            </Link>
          </nav>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CrimeConnect
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <Siren size={14} className="mt-0.5 shrink-0" />
            For immediate danger, contact your local official emergency
            services.
          </p>
        </div>
      </footer>
    </main>
  );
}