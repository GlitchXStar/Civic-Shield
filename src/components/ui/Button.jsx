import { LoaderCircle } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "bg-[#087f76] text-white hover:bg-[#066c64] shadow-lg shadow-teal-900/10",
    secondary: "bg-[#dff8f2] text-[#075f58] hover:bg-[#c9f1e8]",
    outline: "border border-slate-200 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50",
    dark: "bg-slate-950 text-white hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-6 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={17} className="animate-spin" />}
      {children}
    </button>
  );
}
