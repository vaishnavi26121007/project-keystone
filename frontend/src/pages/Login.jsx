import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/UI.jsx";
import { Loader2 } from "lucide-react";

const HOME_BY_ROLE = {
  ADMIN: "/app/dashboard",
  DISPATCHER: "/app/dashboard",
  TECHNICIAN: "/app/work-orders",
  CLIENT: "/app/work-orders",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      showToast("Welcome back!", "success");
      navigate(HOME_BY_ROLE[user.role] || "/app/dashboard");
    } catch (err) {
      setError(err.friendlyMessage || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-white">Keystone</p>
          <p className="text-sm text-slate-400">Field Service Management</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h1 className="text-lg font-semibold text-slate-800">Sign in</h1>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
          <p className="text-sm text-center text-slate-500">
            No account?{" "}
            <Link to="/register" className="text-brand-500 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
