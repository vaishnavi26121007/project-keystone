import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import workOrderApi from "../api/workOrderApi";
import clientApi from "../api/clientApi";
import siteApi from "../api/siteApi";
import assetApi from "../api/assetApi";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/UI.jsx";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function WorkOrderCreate() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    clientId: "",
    siteId: "",
    assetId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });
  const [submitting, setSubmitting] = useState(false);

  // Admin/Dispatcher pick a client explicitly. A CLIENT user's own
  // organization is scoped server-side from their auth token, so we don't
  // show a client picker for them (per spec: no arbitrary client selection).
  const showClientPicker = role === "ADMIN" || role === "DISPATCHER";

  useEffect(() => {
    if (showClientPicker) {
      clientApi
        .getAll()
        .then((res) => setClients(res.data || []))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.clientId) {
      setSites([]);
      return;
    }
    siteApi
      .getByClient(form.clientId)
      .then((res) => setSites(res.data || []))
      .catch(() => setSites([]));
  }, [form.clientId]);

  useEffect(() => {
    if (!form.siteId) {
      setAssets([]);
      return;
    }
    assetApi
      .getBySite(form.siteId)
      .then((res) => setAssets(res.data || []))
      .catch(() => setAssets([]));
  }, [form.siteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assetId) delete payload.assetId;
      if (!showClientPicker) delete payload.clientId; // let backend infer from the authenticated client
      const res = await workOrderApi.create(payload);
      showToast("Work order created", "success");
      const id = res.data?.id;
      navigate(id ? `/app/work-orders/${id}` : "/app/work-orders");
    } catch (err) {
      showToast(
        err.friendlyMessage || "Couldn't create the work order",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">New work order</h1>
        <p className="text-sm text-slate-500">
          Describe the job to schedule field service
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {showClientPicker && (
          <div>
            <label className="label">Client</label>
            <select
              required
              className="input"
              value={form.clientId}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientId: e.target.value,
                  siteId: "",
                  assetId: "",
                })
              }
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {showClientPicker && (
          <div>
            <label className="label">Site</label>
            <select
              required
              className="input"
              disabled={!form.clientId}
              value={form.siteId}
              onChange={(e) =>
                setForm({ ...form, siteId: e.target.value, assetId: "" })
              }
            >
              <option value="">
                {form.clientId ? "Select a site" : "Select a client first"}
              </option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteName || s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!showClientPicker && (
          <div>
            <label className="label">Site</label>
            <input
              required
              className="input"
              placeholder="Site ID (as provided by your organization)"
              value={form.siteId}
              onChange={(e) => setForm({ ...form, siteId: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="label">Asset (optional)</label>
          <select
            className="input"
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            disabled={!form.siteId}
          >
            <option value="">No specific asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.assetName || a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Title</label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g. AC not cooling"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Description of the problem</label>
          <textarea
            required
            rows={4}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating..." : "Create work order"}
          </button>
        </div>
      </form>
    </div>
  );
}
