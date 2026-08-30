import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";
import workOrderApi from "../api/workOrderApi";
import { Loading, ErrorState, EmptyState, StatusBadge, PriorityBadge } from "../components/UI.jsx";
import { formatDate } from "../utils/format";

export default function Overdue() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    setStatus("loading");
    try {
      const res = await workOrderApi.getOverdue();
      setOrders(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertOctagon className="text-red-500" size={22} />
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Overdue work orders</h1>
          <p className="text-sm text-slate-500">Jobs past their due date</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && orders.length === 0 && <EmptyState title="Nothing overdue right now" />}
        {status === "success" && orders.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Work order</th>
                <th>Client</th>
                <th>Technician</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((wo) => (
                <tr key={wo.id} className="border-l-2 border-red-400">
                  <td>
                    <Link to={`/app/work-orders/${wo.id}`} className="text-brand-600 hover:underline font-medium">
                      {wo.title || wo.description?.slice(0, 40) || `WO-${wo.id}`}
                    </Link>
                  </td>
                  <td>{wo.clientName || wo.clientId || "—"}</td>
                  <td>{wo.technicianName || wo.technicianId || "Unassigned"}</td>
                  <td><PriorityBadge value={wo.priority} /></td>
                  <td><StatusBadge value={wo.status} /></td>
                  <td className="text-red-600 font-medium">{formatDate(wo.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
