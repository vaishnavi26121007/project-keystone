import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dashboardApi from "../api/dashboardApi";
import partApi from "../api/partApi";
import workOrderApi from "../api/workOrderApi";
import { Loading, ErrorState, EmptyState, StatusBadge, PriorityBadge } from "../components/UI.jsx";

function titleCase(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    setStatus("loading");
    try {
      const [statsRes, lowStockRes, overdueRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        partApi.getLowStock(),
        workOrderApi.getOverdue(),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data || {});
      if (lowStockRes.status === "fulfilled") setLowStock(lowStockRes.value.data || []);
      if (overdueRes.status === "fulfilled") setOverdue(overdueRes.value.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === "loading") return <Loading label="Loading dashboard..." />;
  if (status === "error") return <ErrorState onRetry={load} />;

  const statEntries = stats
    ? Object.entries(stats).filter(([, v]) => typeof v === "number" || typeof v === "string")
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Operations overview</p>
      </div>

      {statEntries.length === 0 ? (
        <EmptyState title="No dashboard stats returned by the API" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statEntries.map(([key, value]) => (
            <div key={key} className="card p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{titleCase(key)}</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">Low stock inventory</h2>
            <Link to="/app/parts" className="text-sm text-brand-500">
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState title="No low-stock parts" />
          ) : (
            <table className="dt">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>Qty</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 6).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="text-red-600 font-medium">{p.quantity}</td>
                    <td>{p.reorderThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">Overdue work orders</h2>
            <Link to="/app/overdue" className="text-sm text-brand-500">
              View all
            </Link>
          </div>
          {overdue.length === 0 ? (
            <EmptyState title="Nothing overdue" />
          ) : (
            <table className="dt">
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {overdue.slice(0, 6).map((wo) => (
                  <tr key={wo.id}>
                    <td>
                      <Link to={`/app/work-orders/${wo.id}`} className="text-brand-600 hover:underline">
                        {wo.title || wo.description?.slice(0, 30) || `WO-${wo.id}`}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge value={wo.status} />
                    </td>
                    <td>
                      <PriorityBadge value={wo.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
