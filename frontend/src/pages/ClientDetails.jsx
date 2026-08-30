import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import clientApi from "../api/clientApi";
import siteApi from "../api/siteApi";
import workOrderApi from "../api/workOrderApi";
import { Loading, ErrorState, EmptyState, StatusBadge, PriorityBadge } from "../components/UI.jsx";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [sites, setSites] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    setStatus("loading");
    try {
      const [clientRes, sitesRes, woRes] = await Promise.allSettled([
        clientApi.getById(id),
        siteApi.getByClient(id),
        workOrderApi.getByClient(id),
      ]);
      if (clientRes.status === "fulfilled") setClient(clientRes.value.data);
      else throw new Error("not found");
      if (sitesRes.status === "fulfilled") setSites(sitesRes.value.data || []);
      if (woRes.status === "fulfilled") setWorkOrders(woRes.value.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <Loading />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load this client." />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card p-5">
        <h1 className="text-xl font-semibold text-slate-800">{client.companyName}</h1>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
          <p><span className="text-slate-500">Contact email:</span> {client.contactEmail || "—"}</p>
          <p><span className="text-slate-500">Contact phone:</span> {client.contactPhone || "—"}</p>
          <p><span className="text-slate-500">Billing address:</span> {client.billingAddress || "—"}</p>
          <p><span className="text-slate-500">SLA tier:</span> {client.slaTier || "—"}</p>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Sites</h2>
        </div>
        {sites.length === 0 ? (
          <EmptyState title="No sites for this client" />
        ) : (
          <table className="dt">
            <thead>
              <tr>
                <th>Site</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800">{s.siteName || s.name}</td>
                  <td>{s.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Work orders</h2>
        </div>
        {workOrders.length === 0 ? (
          <EmptyState title="No work orders for this client" />
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
              {workOrders.map((wo) => (
                <tr key={wo.id}>
                  <td>
                    <Link to={`/app/work-orders/${wo.id}`} className="text-brand-600 hover:underline">
                      {wo.title || wo.description?.slice(0, 30) || `WO-${wo.id}`}
                    </Link>
                  </td>
                  <td><StatusBadge value={wo.status} /></td>
                  <td><PriorityBadge value={wo.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
