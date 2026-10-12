
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ambulance,
  ShieldCheck,
  MapPin,
  Navigation,
  Phone,
  FileText,
  LocateFixed,
  ExternalLink,
  CheckCircle2,
  Siren,
  HeartPulse,
  Flame,
  Copy,
  Info,
} from "lucide-react";

const EMERGENCY_NUMBER = "112";

export default function Emergency() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);

  const getLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location access. Open the map and search manually."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError(
          "Location access was unavailable. Allow location permission in your browser or search for your location manually."
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  };

  const mapUrl = location
    ? `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=16/${location.lat}/${location.lon}`
    : "https://www.openstreetmap.org/search?query=police%20station";

  const policeUrl = location
    ? `https://www.openstreetmap.org/search?query=police%20station%20near%20${location.lat}%2C${location.lon}`
    : "https://www.openstreetmap.org/search?query=police%20station";

  const directionsUrl = location
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${location.lat}%2C${location.lon}`
    : "https://www.openstreetmap.org/directions";

  const copyLocation = async () => {
    if (!location) {
      getLocation();
      return;
    }

    const text = `${location.lat}, ${location.lon}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setLocationError(
        "Could not copy automatically. Your coordinates are displayed on the map."
      );
    }
  };

  const services = [
    {
      icon: ShieldCheck,
      title: "Police assistance",
      description: "For crimes, threats, violence, or immediate danger.",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      icon: Ambulance,
      title: "Medical emergency",
      description: "For serious injuries or urgent medical assistance.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Flame,
      title: "Fire and rescue",
      description: "For fires, hazardous situations, or rescue assistance.",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const safetySteps = [
    {
      title: "Move to a safer place",
      description:
        "If possible, move away from danger without putting yourself at greater risk.",
    },
    {
      title: "Contact emergency services",
      description:
        "Call the official emergency number and clearly explain what happened and where you are.",
    },
    {
      title: "Share your location",
      description:
        "Give responders a nearby landmark, street name, or your device's location.",
    },
    {
      title: "Follow official instructions",
      description:
        "Follow the emergency operator's directions. Do not confront a dangerous person.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* EMERGENCY ALERT STRIP */}
      <div className="bg-red-700 px-4 py-3 text-center text-sm font-semibold text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <AlertTriangle size={18} />
          In immediate danger? Call emergency services now.
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            className="ml-1 underline underline-offset-4"
          >
            Dial {EMERGENCY_NUMBER}
          </a>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* BACK LINK */}
        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                <Siren size={16} />
                Emergency assistance
              </span>

              <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Get help when
                <span className="block text-red-400">
                  every second matters.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Find emergency contact options, locate nearby police
                stations, and access safety guidance. Do not wait for an
                online crime report if someone is in immediate danger.
              </p>
            </div>

            {/* PROMINENT CALL ACTION */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 lg:min-w-64">
              <p className="text-sm font-medium text-slate-300">
                Official emergency number
              </p>

              <p className="mt-2 text-5xl font-black tracking-tight">
                {EMERGENCY_NUMBER}
              </p>

              <a
                href={`tel:${EMERGENCY_NUMBER}`}
                className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-4 font-bold text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                <Phone size={21} />
                Call {EMERGENCY_NUMBER}
              </a>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                On a compatible device, this opens your phone's calling
                application. On desktop, calling may not be supported.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section aria-labelledby="quick-actions-title" className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-700">
              Immediate actions
            </p>

            <h2
              id="quick-actions-title"
              className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              What do you need help with?
            </h2>

            <p className="mt-2 text-slate-600">
              Choose an action below to contact help or find nearby services.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* CALL */}
            <article className="flex flex-col rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
                <Phone size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Emergency services
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                Contact emergency responders for urgent police, medical,
                fire, or rescue assistance.
              </p>

              <a
                href={`tel:${EMERGENCY_NUMBER}`}
                className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
              >
                <Phone size={18} />
                Call {EMERGENCY_NUMBER}
              </a>
            </article>

            {/* POLICE STATION */}
            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <MapPin size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Find a police station
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                Search OpenStreetMap for police stations near your current
                location or another location you choose.
              </p>

              <a
                href={policeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white hover:bg-teal-800"
              >
                <MapPin size={18} />
                Find police stations
                <ExternalLink size={15} />
              </a>
            </article>

            {/* REPORT */}
            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <FileText size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Report a crime online
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                For non-immediate situations, use your application's
                reporting process to submit incident details.
              </p>

              <Link
                to="/register"
                className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-800 hover:border-teal-600 hover:text-teal-700"
              >
                Start a report
                <ArrowRight size={18} />
              </Link>
            </article>
          </div>
        </section>

        {/* LOCATION / OPENSTREETMAP */}
        <section
          aria-labelledby="location-title"
          className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                <LocateFixed size={15} />
                OpenStreetMap
              </span>

              <h2
                id="location-title"
                className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Find your location
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Allow location access to find your coordinates and open
                the map around your position. Your browser will ask for
                permission first.
              </p>

              <button
                type="button"
                onClick={getLocation}
                disabled={locating}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                <LocateFixed size={19} />
                {locating ? "Finding your location..." : "Use my location"}
              </button>

              {location && (
                <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <p className="flex items-center gap-2 font-semibold text-teal-900">
                    <CheckCircle2 size={18} />
                    Location found
                  </p>

                  <p className="mt-3 break-all text-sm text-slate-700">
                    Latitude: {location.lat.toFixed(6)}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-700">
                    Longitude: {location.lon.toFixed(6)}
                  </p>

                  <button
                    type="button"
                    onClick={copyLocation}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-800 underline underline-offset-4"
                  >
                    <Copy size={15} />
                    {copied ? "Coordinates copied" : "Copy coordinates"}
                  </button>
                </div>
              )}

              {locationError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  {locationError}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800 hover:text-teal-950"
                >
                  <MapPin size={18} />
                  Open map
                  <ExternalLink size={15} />
                </a>

                <a
                  href={policeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800 hover:text-teal-950"
                >
                  <ShieldCheck size={18} />
                  Search nearby police stations
                  <ExternalLink size={15} />
                </a>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800 hover:text-teal-950"
                >
                  <Navigation size={18} />
                  Open directions
                  <ExternalLink size={15} />
                </a>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Location is accessed only after you press the location
                button and grant browser permission. Always verify the
                address and available services before travelling.
              </p>
            </div>

            {/* MAP PREVIEW */}
            <div className="min-h-80 border-t border-slate-200 bg-slate-100 lg:min-h-[500px] lg:border-l lg:border-t-0">
              <iframe
                title="OpenStreetMap location and nearby police stations"
                src={
                  location
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.025}%2C${location.lat - 0.015}%2C${location.lon + 0.025}%2C${location.lat + 0.015}&layer=mapnik&marker=${location.lat}%2C${location.lon}`
                    : "https://www.openstreetmap.org/export/embed.html?bbox=72.75%2C18.85%2C73.05%2C19.15&layer=mapnik"
                }
                className="h-80 w-full lg:h-full lg:min-h-[500px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p className="bg-white px-4 py-3 text-xs text-slate-500">
                Map data © OpenStreetMap contributors. The initial map is
                a sample view; select “Use my location” to center it on
                your coordinates.
              </p>
            </div>
          </div>
        </section>

        {/* EMERGENCY SERVICES */}
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Choose the right emergency service
          </h2>

          <p className="mt-2 leading-7 text-slate-600">
            Explain the situation clearly to the official emergency
            operator and follow their instructions.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {services.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl ${services.find((s) => s.title === title).bg} ${services.find((s) => s.title === title).color}`}
                >
                  <Icon size={24} />
                </div>

                <h3 className="mt-4 font-bold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>

                <a
                  href={`tel:${EMERGENCY_NUMBER}`}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 font-bold text-teal-800 hover:text-teal-950"
                >
                  <Phone size={17} />
                  Call {EMERGENCY_NUMBER}
                  <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* SAFETY CHECKLIST */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <HeartPulse size={24} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
                Stay safe
              </p>

              <h2 className="mt-1 text-2xl font-extrabold">
                What to do in an emergency
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                Keep yourself and others safe while professional help
                is being arranged.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {safetySteps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 font-extrabold text-slate-700">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL WARNING */}
        <section className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Info size={22} className="mt-0.5 shrink-0 text-red-700" />

            <div>
              <h2 className="font-extrabold text-red-900">
                Important emergency notice
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-900">
                CrimeConnect is an online reporting interface, not an
                emergency dispatch service. Submitting a report here does
                not automatically alert police or send responders to
                your location. Call the official emergency service
                directly when immediate help is needed.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-slate-200 py-7 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white">
              <ShieldCheck size={22} />
            </span>

            <span>
              <span className="block font-extrabold">CrimeConnect</span>
              <span className="text-xs text-slate-500">
                Public Safety Platform
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-teal-700">
              Home
            </Link>

            <Link to="/login" className="hover:text-teal-700">
              Sign in
            </Link>

            <a
              href="https://112.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-700"
            >
              Official emergency information
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}