import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import workOrderApi from "../api/workOrderApi";
import { useAuth } from "../context/AuthContext.jsx";
import { Loading, ErrorState, EmptyState, StatusBadge, PriorityBadge } from "../components/UI.jsx";
import { formatDate } from "../utils/format";

const STATUS_OPTIONS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function WorkOrders() {
  const { role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const load = async () => {
    setStatus("loading");
    try {
      // GET /api/work-orders is role-aware on the backend: admins/dispatchers
      // get everything, clients get their own org's orders, technicians get
      // their assigned orders — so the same call works for every role.
      const res = await workOrderApi.getAll();
      setOrders(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((wo) => {
      if (statusFilter && wo.status !== statusFilter) return false;
      if (priorityFilter && wo.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = [wo.title, wo.description, wo.clientName, wo.siteName].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, priorityFilter, search]);

  const canCreate = role === "ADMIN" || role === "DISPATCHER" || role === "CLIENT";
  const isAdminLike = role === "ADMIN" || role === "DISPATCHER";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {role === "TECHNICIAN" ? "My work orders" : role === "CLIENT" ? "My work orders" : "Work orders"}
          </h1>
          <p className="text-sm text-slate-500">
            {role === "TECHNICIAN" ? "Jobs assigned to you" : role === "CLIENT" ? "Requests submitted by your organization" : "All work orders"}
          </p>
        </div>
        {canCreate && (
          <Link to="/app/work-orders/new" className="btn-primary">
            <Plus size={16} /> New work order
          </Link>
        )}
      </div>

      {isAdminLike && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input className="input pl-8 w-56" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input w-40" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && filtered.length === 0 && (
          <EmptyState title="No work orders found" subtitle={canCreate ? "Create one to get started" : undefined} />
        )}
        {status === "success" && filtered.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Work order</th>
                {isAdminLike && <th>Client</th>}
                {isAdminLike && <th>Technician</th>}
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo) => (
                <tr key={wo.id}>
                  <td>
                    <Link to={`/app/work-orders/${wo.id}`} className="text-brand-600 hover:underline font-medium">
                      {wo.title || wo.description?.slice(0, 40) || `WO-${wo.id}`}
                    </Link>
                  </td>
                  {isAdminLike && <td>{wo.clientName || wo.clientId || "—"}</td>}
                  {isAdminLike && <td>{wo.technicianName || wo.technicianId || "Unassigned"}</td>}
                  <td><PriorityBadge value={wo.priority} /></td>
                  <td><StatusBadge value={wo.status} /></td>
                  <td>{formatDate(wo.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
