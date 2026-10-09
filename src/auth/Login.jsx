
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const dashboardRoutes = {
  citizen: "/citizen/dashboard",
  police: "/police/dashboard",
  police_officer: "/police/dashboard",
  admin: "/admin/dashboard",
  administrator: "/admin/dashboard",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const users = JSON.parse(
        localStorage.getItem("crimeconnect_users") || "[]"
      );

      if (!Array.isArray(users)) {
        setError("Account data is invalid. Please register again.");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const user = users.find(
        (item) =>
          String(item.email || "").trim().toLowerCase() ===
            normalizedEmail &&
          item.password === password
      );

      if (!user) {
        setError(
          "Incorrect email or password. Please check your details or register first."
        );
        return;
      }

      const role = String(user.role || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      const destination = dashboardRoutes[role];

      if (!destination) {
        setError("No dashboard is configured for your account role.");
        return;
      }

      // Do not store the password in the signed-in user object.
      const { password: ignoredPassword, ...safeUser } = user;

      localStorage.setItem(
        "crimeconnect_current_user",
        JSON.stringify(safeUser)
      );

      // Compatibility with existing frontend components.
      localStorage.setItem("user", JSON.stringify(safeUser));
      localStorage.setItem("isLoggedIn", "true");

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to read account data. Please register again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-teal-700" />

          <h1 className="text-3xl font-bold text-slate-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-500">
            Login to CrimeConnect
          </p>
        </div>

        {location.state?.message && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {location.state.message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-teal-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 p-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-teal-700 hover:underline"
          >
            Register / Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

