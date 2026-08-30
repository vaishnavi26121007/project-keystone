
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/UI.jsx";
import { Loader2 } from "lucide-react";

const ROLES = ["ADMIN", "DISPATCHER", "TECHNICIAN", "CLIENT"];

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "CLIENT",
    companyName: "",
    specialization: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = { ...form };

      // Only send CLIENT-specific fields for CLIENT
      if (form.role !== "CLIENT") {
        delete payload.companyName;
      }

      // Only send technician-specific field for TECHNICIAN
      if (form.role !== "TECHNICIAN") {
        delete payload.specialization;
      }

      await register(payload);

      showToast("Account created. Please sign in.", "success");
      navigate("/login");

    } catch (err) {
      setError(
        err.friendlyMessage || "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-white">
            Keystone
          </p>
          <p className="text-sm text-slate-400">
            Field Service Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card p-6 space-y-4"
        >
          <h1 className="text-lg font-semibold text-slate-800">
            Create an account
          </h1>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label">
              Full name
            </label>

            <input
              required
              className="input"
              value={form.fullName}
              onChange={update("fullName")}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label">
              Email
            </label>

            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">
              Password
            </label>

            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label">
              Phone
            </label>

            <input
              type="tel"
              className="input"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="label">
              Role
            </label>

            <select
              className="input"
              value={form.role}
              onChange={update("role")}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {form.role === "CLIENT" && (
            <div>
              <label className="label">
                Company / Organization
              </label>

              <input
                required
                className="input"
                placeholder="e.g. ABC Industries"
                value={form.companyName}
                onChange={update("companyName")}
              />

              <p className="text-xs text-slate-400 mt-1">
                A client organization will be created for your account.
              </p>
            </div>
          )}

          {form.role === "TECHNICIAN" && (
            <div>
              <label className="label">
                Specialization
              </label>

              <input
                className="input"
                placeholder="e.g. HVAC, Electrical"
                value={form.specialization}
                onChange={update("specialization")}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Create account
          </button>

          <p className="text-sm text-center text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-500 font-medium"
            >
              Sign in
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

