import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import clientApi from "../api/clientApi";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, Loading, ErrorState, EmptyState, Modal, ConfirmDialog } from "../components/UI.jsx";

const EMPTY_FORM = { companyName: "", contactEmail: "", contactPhone: "", billingAddress: "", slaTier: "" };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { role } = useAuth();
  const { showToast } = useToast();

  const load = async () => {
    setStatus("loading");
    try {
      const res = await clientApi.getAll();
      setClients(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) =>
      [c.companyName, c.contactEmail, c.slaTier].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [clients, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      companyName: client.companyName || "",
      contactEmail: client.contactEmail || "",
      contactPhone: client.contactPhone || "",
      billingAddress: client.billingAddress || "",
      slaTier: client.slaTier || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await clientApi.update(editing.id, form);
        showToast("Client updated", "success");
      } else {
        await clientApi.create(form);
        showToast("Client created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clientApi.remove(toDelete.id);
      showToast("Client deleted", "success");
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
          <h1 className="text-xl font-semibold text-slate-800">Clients</h1>
          <p className="text-sm text-slate-500">Manage client accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              className="input pl-8 w-56"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add client
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && filtered.length === 0 && (
          <EmptyState title="No clients found" subtitle="Add a client to get started" />
        )}
        {status === "success" && filtered.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact email</th>
                <th>Phone</th>
                <th>SLA tier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-slate-800">{c.companyName}</td>
                  <td>{c.contactEmail}</td>
                  <td>{c.contactPhone}</td>
                  <td>{c.slaTier}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link to={`/app/clients/${c.id}`} className="p-1.5 text-slate-500 hover:text-brand-600" title="View">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-brand-600" title="Edit">
                        <Pencil size={16} />
                      </button>
                      {role === "ADMIN" && (
                        <button onClick={() => setToDelete(c)} className="p-1.5 text-slate-500 hover:text-red-600" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
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
        title={editing ? "Edit client" : "Add client"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button form="client-form" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Company name</label>
            <input required className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input type="email" required className="input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <div>
            <label className="label">Billing address</label>
            <input className="input" value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} />
          </div>
          <div>
            <label className="label">SLA tier</label>
            <input className="input" placeholder="e.g. GOLD" value={form.slaTier} onChange={(e) => setForm({ ...form, slaTier: e.target.value })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete client"
        message={`Delete "${toDelete?.companyName}"? This can't be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        danger
      />
    </div>
  );
}
