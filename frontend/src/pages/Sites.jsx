import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import siteApi from "../api/siteApi";
import clientApi from "../api/clientApi";
import {
  useToast,
  Loading,
  ErrorState,
  EmptyState,
  Modal,
  ConfirmDialog,
} from "../components/UI.jsx";

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  clientId: "",
};

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("loading");
  const [clientFilter, setClientFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setStatus("loading");
    try {
      const [sitesRes, clientsRes] = await Promise.all([
        siteApi.getAll(),
        clientApi.getAll(),
      ]);
      setSites(sitesRes.data || []);
      setClients(clientsRes.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const clientName = (id) =>
    clients.find((c) => c.id === id)?.companyName || id;

  const filtered = useMemo(() => {
    if (!clientFilter) return sites;
    return sites.filter((s) => String(s.clientId) === String(clientFilter));
  }, [sites, clientFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

const handleSave = async (e) => {
  e.preventDefault();

  setSaving(true);

  try {
    console.log("SITE FORM:", form);

    await siteApi.create(form);

    showToast("Site created", "success");
    setModalOpen(false);
    load();
  } catch (err) {
    console.error("SITE ERROR:", err.response?.data);
    showToast(err.friendlyMessage || "Save failed", "error");
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async () => {
    try {
      await siteApi.remove(toDelete.id);
      showToast("Site deleted", "success");
      setToDelete(null);
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sites</h1>
          <p className="text-sm text-slate-500">Client locations</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-48"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add site
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && filtered.length === 0 && (
          <EmptyState title="No sites found" />
        )}
        {status === "success" && filtered.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Site</th>
                <th>Address</th>
                <th>Client</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800">
                    {s.siteName || s.name}
                  </td>
                  <td>{s.address}</td>
                  <td>{clientName(s.clientId)}</td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setToDelete(s)}
                        className="p-1.5 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add site"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button form="site-form" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <form id="site-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Client</label>
            <select
              required
              className="input"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Site name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              required
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete site"
        message={`Delete "${toDelete?.siteName || toDelete?.name}"? This can't be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        danger
      />
    </div>
  );
}
