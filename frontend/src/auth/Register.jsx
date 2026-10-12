
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "citizen",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("crimeconnect_users") || "[]"
      );

      const email = form.email.trim().toLowerCase();

      if (users.some((user) => user.email === email)) {
        setError("This email is already registered. Please log in.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name.trim(),
        email,
        password: form.password,
        role: form.role,
      };

      localStorage.setItem(
        "crimeconnect_users",
        JSON.stringify([...users, newUser])
      );

      navigate("/login", {
        state: {
          message: "Registration successful! Please log in.",
          email,
        },
      });
    } catch {
      setError("Unable to save your account in this browser.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-teal-700" />
          <h1 className="text-3xl font-bold text-slate-800">
            Create Account
          </h1>
          <p className="mt-2 text-slate-500">
            Join CrimeConnect
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            autoComplete="name"
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full rounded-lg border p-3"
          />

          <label className="block text-sm font-medium text-slate-700">
            Register as
          </label>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border bg-white p-3"
          >
            <option value="citizen">Citizen</option>
            <option value="police">Police Officer</option>
            <option value="admin">Administrator</option>
          </select>

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password (at least 6 characters)"
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-teal-700 p-3 font-semibold text-white hover:bg-teal-800"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-teal-700">
            Login
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          Frontend demo only. Role selection is not verified.
        </p>
      </div>
    </div>
  );
}