import { useEffect, useState } from "react";
import technicianApi from "../api/technicianApi";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, Loading, ErrorState, EmptyState, StatusBadge } from "../components/UI.jsx";

const STATUS_OPTIONS = ["AVAILABLE", "ON_JOB", "OFF_DUTY"];

export default function Technicians() {
  const { role, user } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [status, setStatus] = useState("loading");
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setStatus("loading");
    try {
      if (role === "TECHNICIAN") {
        // Technicians only get to see and control their own record.
        if (!user?.technicianId) {
          setTechnicians([]);
        } else {
          const res = await technicianApi.getByUser(user.userId);
          setTechnicians(res.data ? [res.data] : []);
        }
      } else {
        const res = await technicianApi.getAll();
        setTechnicians(res.data || []);
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleAvailability = async (tech, newStatus) => {
    setUpdatingId(tech.id);
    try {
      await technicianApi.updateAvailability(tech.id, newStatus);
      showToast("Availability updated", "success");
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          {role === "TECHNICIAN" ? "My availability" : "Technicians"}
        </h1>
        <p className="text-sm text-slate-500">
          {role === "TECHNICIAN" ? "Update your current status" : "Field technicians and their availability"}
        </p>
      </div>

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && technicians.length === 0 && <EmptyState title="No technicians found" />}
        {status === "success" && technicians.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Availability</th>
                <th>Update status</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-slate-800">{t.name || t.fullName}</td>
                  <td>{t.email || t.phone || "—"}</td>
                  <td><StatusBadge value={t.availabilityStatus || t.status} /></td>
                  <td>
                    <select
                      className="input w-40"
                      disabled={updatingId === t.id}
                      value={t.availabilityStatus || t.status || ""}
                      onChange={(e) => handleAvailability(t, e.target.value)}
                    >
                      <option value="" disabled>Set status</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
