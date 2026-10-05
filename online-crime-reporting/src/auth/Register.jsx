import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-teal-50 to-white px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Citizen registration</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">The form is ready to connect to your real authentication service.</p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          if (form.password.value !== form.confirmPassword.value) {
            return toast.error("Passwords do not match");
          }
          setLoading(true);
          try {
            const res = await api.post('/auth/register', {
              firstName: form.firstName.value,
              lastName: form.lastName.value,
              email: form.email.value,
              phone: form.phone.value,
              password: form.password.value,
              role: form.role.value,
            });
            const { token, user } = res.data.data;
            login(token, user);
            toast.success("Account registered successfully, redirecting to dashboard");
            setTimeout(() => {
              navigate(`/${user.role.toLowerCase()}/dashboard`);
            }, 1000);
          } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
              const messages = Object.values(data.errors).flat().join(', ');
              toast.error(messages);
            } else {
              toast.error(data?.message || 'Registration failed');
            }
          } finally {
            setLoading(false);
          }
        }} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Role
              <select name="role" required className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500 bg-white">
                <option value="CITIZEN">Citizen</option>
                <option value="POLICE">Police Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <Field name="firstName" label="First name" required />
            <Field name="lastName" label="Last name" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone number" type="tel" required />
            <Field name="password" label="Password" type="password" required />
            <Field name="confirmPassword" label="Confirm password" type="password" required />
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm text-slate-600"><input required type="checkbox" className="mt-1" /> I agree to the platform terms and understand that false information may have legal consequences.</label>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-teal-700">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", required }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} required={required} type={type} className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>;
}
