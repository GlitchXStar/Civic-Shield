import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    try {
      const res = await api.post('/auth/login', {
        email: form.email.value,
        password: form.password.value,
      });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(res.data.message);
      
      const destination = location.state?.from?.pathname || `/${user.role.toLowerCase()}/dashboard`;
      navigate(destination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your reporting workspace.">
      <form onSubmit={handleSubmit} className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><Mail size={15} /> Email</span><input name="email" required type="email" autoComplete="email" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>
        <label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><LockKeyhole size={15} /> Password</span><input name="password" required type="password" autoComplete="current-password" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-teal-500" /></label>
        <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Remember me</label><Link to="/forgot-password" className="font-semibold text-teal-700">Forgot password?</Link></div>
        <Button type="submit" size="lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        <p className="text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="font-bold text-teal-700">Create one</Link></p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-teal-50 to-white px-5 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#087f76] text-white"><ShieldCheck size={25} /></span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft sm:p-9">{children}</div>
      </div>
    </div>
  );
}
