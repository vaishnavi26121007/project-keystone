import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import assetApi from "../api/assetApi";
import siteApi from "../api/siteApi";
import {
  useToast,
  Loading,
  ErrorState,
  EmptyState,
  Modal,
  ConfirmDialog,
} from "../components/UI.jsx";

const EMPTY_FORM = { assetName: "", model: "", serialNumber: "", siteId: "" };

export default function Assets() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState("idle");
  const [sitesStatus, setSitesStatus] = useState("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const loadSites = async () => {
    setSitesStatus("loading");
    try {
      const res = await siteApi.getAll();
      setSites(res.data || []);
      setSitesStatus("success");
      if (res.data?.length) setSelectedSite(String(res.data[0].id));
    } catch {
      setSitesStatus("error");
    }
  };

  const loadAssets = async (siteId) => {
    if (!siteId) return;
    setStatus("loading");
    try {
      const res = await assetApi.getBySite(siteId);
      setAssets(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) loadAssets(selectedSite);
  }, [selectedSite]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, siteId: selectedSite });
    setModalOpen(true);
  };

 const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const payload = {
      name: form.assetName,
      modelNumber: form.model,
      serialNumber: form.serialNumber,
      siteId: Number(form.siteId),
    };

    console.log("ASSET PAYLOAD:", payload);

    await assetApi.create(payload);

    showToast("Asset created", "success");
    setModalOpen(false);
    setForm(EMPTY_FORM);

    await loadAssets(selectedSite);
  } catch (err) {
    console.error("ASSET ERROR:", err.response?.data || err);

    showToast(
      err.response?.data?.message ||
      err.friendlyMessage ||
      "Save failed",
      "error"
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async () => {
    try {
      await assetApi.remove(toDelete.id);
      showToast("Asset deleted", "success");
      setToDelete(null);
      loadAssets(selectedSite);
    } catch (err) {
      showToast(err.friendlyMessage || "Delete failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Assets</h1>
          <p className="text-sm text-slate-500">
            Equipment installed at a site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-56"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.siteName || s.name}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={openCreate}
            disabled={!selectedSite}
          >
            <Plus size={16} /> Add asset
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {sitesStatus === "loading" && <Loading label="Loading sites..." />}
        {sitesStatus === "success" && sites.length === 0 && (
          <EmptyState
            title="No sites yet"
            subtitle="Create a site first to add assets to it"
          />
        )}
        {sitesStatus === "success" &&
          sites.length > 0 &&
          status === "loading" && <Loading label="Loading assets..." />}
        {status === "error" && (
          <ErrorState onRetry={() => loadAssets(selectedSite)} />
        )}
        {status === "success" && assets.length === 0 && (
          <EmptyState title="No assets at this site" />
        )}
        {status === "success" && assets.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Model</th>
                <th>Serial number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-slate-800">{a.name}</td>
                  <td>{a.modelNumber}</td>
                  <td>{a.serialNumber}</td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setToDelete(a)}
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
        title="Add asset"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button form="asset-form" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <form id="asset-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Site</label>
            <select
              required
              className="input"
              value={form.siteId}
              onChange={(e) => setForm({ ...form, siteId: e.target.value })}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteName || s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Asset name</label>
            <input
              required
              className="input"
              value={form.assetName}
              onChange={(e) => setForm({ ...form, assetName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Model</label>
            <input
              className="input"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Serial number</label>
            <input
              className="input"
              value={form.serialNumber}
              onChange={(e) =>
                setForm({ ...form, serialNumber: e.target.value })
              }
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete asset"
        message={`Delete "${toDelete?.name}"? This can't be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        danger
      />
    </div>
  );
}
