import { Link } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import { authApi } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await authApi.forgotPassword({ email });
      setSent(true);
      setMessage(res.message || "If that email exists in our system, password reset instructions have been sent.");
    } catch (err) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-teal-50 to-white px-5 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">
          <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <Mail />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-950">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enter the email address associated with your account.</p>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {sent ? (
            <div className="mt-5 rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-teal-700" />
              <p className="mt-3 text-sm font-bold text-teal-900">{message}</p>
              <Link to="/login" className="mt-6 inline-block text-sm font-bold text-teal-700 hover:underline">
                Back to sign in →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500"
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  "Request reset"
                )}
              </Button>
            </form>
          )}

          {!sent && (
            <Link to="/login" className="mt-5 block text-center text-sm font-bold text-teal-700 hover:underline">
              Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
