import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import partApi from "../api/partApi";
import { useToast, Loading, ErrorState, EmptyState, Modal } from "../components/UI.jsx";

const EMPTY_FORM = { name: "", sku: "", unitCost: "", quantity: "", reorderThreshold: "" };

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setStatus("loading");
    try {
      const res = lowStockOnly ? await partApi.getLowStock() : await partApi.getAll();
      setParts(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly]);

  const isLow = (p) => Number(p.quantity) <= Number(p.reorderThreshold);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      sku: p.sku || "",
      unitCost: p.unitCost ?? "",
      quantity: p.quantity ?? "",
      reorderThreshold: p.reorderThreshold ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      unitCost: Number(form.unitCost),
      quantity: Number(form.quantity),
      reorderThreshold: Number(form.reorderThreshold),
    };
    try {
      if (editing) {
        await partApi.update(editing.id, payload);
        showToast("Part updated", "success");
      } else {
        await partApi.create(payload);
        showToast("Part created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-500">Parts and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
            Low stock only
          </label>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add part
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "success" && parts.length === 0 && <EmptyState title="No parts found" />}
        {status === "success" && parts.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Part</th>
                <th>SKU</th>
                <th>Unit cost</th>
                <th>Quantity</th>
                <th>Reorder at</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id} className={isLow(p) ? "bg-red-50/50" : ""}>
                  <td className="font-medium text-slate-800">{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.unitCost}</td>
                  <td className={isLow(p) ? "text-red-600 font-semibold" : ""}>{p.quantity}</td>
                  <td>{p.reorderThreshold}</td>
                  <td>
                    {isLow(p) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertTriangle size={13} /> Low stock
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">In stock</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-brand-600">
                        <Pencil size={16} />
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
        title={editing ? "Edit part" : "Add part"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button form="part-form" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </>
        }
      >
        <form id="part-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">SKU</label>
            <input required className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Unit cost</label>
              <input type="number" step="0.01" required className="input" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" required className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="label">Reorder at</label>
              <input type="number" required className="input" value={form.reorderThreshold} onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
