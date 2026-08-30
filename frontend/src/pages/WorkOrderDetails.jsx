import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Square, Plus } from "lucide-react";
import workOrderApi from "../api/workOrderApi";
import technicianApi from "../api/technicianApi";
import partApi from "../api/partApi";
import { useAuth } from "../context/AuthContext.jsx";
import { Loading, ErrorState, EmptyState, StatusBadge, PriorityBadge, Modal, useToast } from "../components/UI.jsx";
import { formatDate, formatDateTime, formatDuration } from "../utils/format";

const STATUS_OPTIONS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
const TABS = ["Overview", "Parts", "Time Tracking", "Notes"];

export default function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { showToast } = useToast();

  const [wo, setWo] = useState(null);
  const [status, setStatus] = useState("loading");
  const [tab, setTab] = useState("Overview");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await workOrderApi.getById(id);
      setWo(res.data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <Loading />;
  if (status === "error") return <ErrorState onRetry={load} message="Couldn't load this work order." />;

  const canUpdateStatus = role === "ADMIN" || role === "DISPATCHER" || role === "TECHNICIAN";
  const canAssign = role === "ADMIN" || role === "DISPATCHER";

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{wo.title || `Work order #${wo.id}`}</h1>
            <p className="text-sm text-slate-500 mt-1">{wo.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge value={wo.priority} />
            <StatusBadge value={wo.status} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-sm">
          <p><span className="text-slate-500">Client:</span> {wo.clientName || wo.clientId || "—"}</p>
          <p><span className="text-slate-500">Site:</span> {wo.siteName || wo.siteId || "—"}</p>
          <p><span className="text-slate-500">Asset:</span> {wo.assetName || wo.assetId || "—"}</p>
          <p><span className="text-slate-500">Technician:</span> {wo.technicianName || wo.technicianId || "Unassigned"}</p>
          <p><span className="text-slate-500">Due date:</span> {formatDate(wo.dueDate)}</p>
          <p><span className="text-slate-500">Created:</span> {formatDate(wo.createdAt || wo.createdDate)}</p>
        </div>

        {(canUpdateStatus || canAssign) && (
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {canUpdateStatus && <StatusControl wo={wo} onUpdated={load} />}
            {canAssign && <AssignControl wo={wo} onUpdated={load} />}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex border-b border-slate-200 px-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "Overview" && <OverviewTab wo={wo} />}
          {tab === "Parts" && <PartsTab woId={wo.id} />}
          {tab === "Time Tracking" && <TimeTrackingTab woId={wo.id} />}
          {tab === "Notes" && <NotesTab woId={wo.id} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Overview ------------------------------- */

function OverviewTab({ wo }) {
  return (
    <div className="text-sm text-slate-600 space-y-2">
      <p>{wo.description || "No description provided."}</p>
    </div>
  );
}

function StatusControl({ wo, onUpdated }) {
  const [value, setValue] = useState(wo.status || "");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setValue(newStatus);
    setSaving(true);
    try {
      await workOrderApi.updateStatus(wo.id, { status: newStatus });
      showToast("Status updated", "success");
      onUpdated();
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't update status", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-500">Status</label>
      <select className="input w-44" value={value} disabled={saving} onChange={handleChange}>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

function AssignControl({ wo, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const res = await technicianApi.getAvailable();
      setTechnicians(res.data || []);
    } catch {
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await workOrderApi.assign(wo.id, { technicianId: selected });
      showToast("Technician assigned", "success");
      setOpen(false);
      onUpdated();
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't assign technician", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn-secondary" onClick={openModal}>
        {wo.technicianId ? "Reassign technician" : "Assign technician"}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Assign technician"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={!selected || saving} onClick={handleAssign}>
              {saving ? "Assigning..." : "Assign"}
            </button>
          </>
        }
      >
        {loading ? (
          <Loading label="Loading available technicians..." />
        ) : technicians.length === 0 ? (
          <EmptyState title="No available technicians right now" />
        ) : (
          <div className="space-y-1">
            {technicians.map((t) => (
              <label key={t.id} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-50 cursor-pointer">
                <input type="radio" name="technician" value={t.id} checked={String(selected) === String(t.id)} onChange={(e) => setSelected(e.target.value)} />
                <span className="text-sm text-slate-700">{t.name || t.fullName}</span>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

/* -------------------------------- Parts --------------------------------- */

function PartsTab({ woId }) {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [used, setUsed] = useState([]);
  const [status, setStatus] = useState("loading");
  const [allParts, setAllParts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ partId: "", quantity: 1 });
  const [saving, setSaving] = useState(false);
  const canAddParts = role === "ADMIN" || role === "DISPATCHER" || role === "TECHNICIAN";

  const load = async () => {
    setStatus("loading");
    try {
      const res = await workOrderApi.getParts(woId);
      setUsed(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [woId]);

  const openModal = async () => {
    setForm({ partId: "", quantity: 1 });
    setModalOpen(true);
    if (allParts.length === 0) {
      try {
        const res = await partApi.getAll();
        setAllParts(res.data || []);
      } catch {
        setAllParts([]);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workOrderApi.addPart(woId, { partId: form.partId, quantity: Number(form.quantity) });
      showToast("Part added", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't add part", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {canAddParts && (
        <div className="flex justify-end">
          <button className="btn-secondary" onClick={openModal}>
            <Plus size={15} /> Add part
          </button>
        </div>
      )}
      {status === "loading" && <Loading />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && used.length === 0 && <EmptyState title="No parts used yet" />}
      {status === "success" && used.length > 0 && (
        <table className="dt">
          <thead>
            <tr>
              <th>Part</th>
              <th>Quantity</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {used.map((p, i) => (
              <tr key={p.id ?? i}>
                <td>{p.partName || p.name || p.partId}</td>
                <td>{p.quantity}</td>
                <td>{p.cost ?? p.totalCost ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add part"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button form="add-part-form" className="btn-primary" disabled={saving}>{saving ? "Adding..." : "Add"}</button>
          </>
        }
      >
        <form id="add-part-form" onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="label">Part</label>
            <select required className="input" value={form.partId} onChange={(e) => setForm({ ...form, partId: e.target.value })}>
              <option value="">Select a part</option>
              {allParts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" min="1" required className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------------------------- Time tracking ------------------------------ */

function TimeTrackingTab({ woId }) {
  const { role, user } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [activeTimer, setActiveTimer] = useState(null); // { id, startTime } or null
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const intervalRef = useRef(null);
  const isTechnician = role === "TECHNICIAN" && !!user?.technicianId;

  const loadLogs = async () => {
    setStatus("loading");
    try {
      const res = await workOrderApi.getTimeLogs(woId);
      setLogs(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const loadActiveTimer = async () => {
    if (!isTechnician) return;
    try {
      const res = await workOrderApi.getActiveTimer(woId, user.technicianId);
      if (res.status === 204 || !res.data) {
        setActiveTimer(null);
      } else {
        setActiveTimer(res.data);
      }
    } catch {
      setActiveTimer(null);
    }
  };

  useEffect(() => {
    loadLogs();
    loadActiveTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [woId]);

  // Reconstruct the live timer from the active timer's start time so a page
  // refresh doesn't lose progress — the backend is the source of truth.
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (activeTimer) {
      const start = new Date(activeTimer.startTime || activeTimer.startedAt).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeTimer]);

  const handleStart = async () => {
    setBusy(true);
    try {
      const res = await workOrderApi.startTimer(woId, user.technicianId);
      setActiveTimer(res.data || { startTime: new Date().toISOString() });
      showToast("Timer started", "success");
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't start timer", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (!activeTimer?.id) return;
    setBusy(true);
    try {
      await workOrderApi.stopTimer(activeTimer.id);
      showToast("Timer stopped", "success");
      setActiveTimer(null);
      loadLogs();
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't stop timer", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {isTechnician && (
        <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 bg-slate-50">
          <div>
            <p className="text-xs text-slate-500">Your timer</p>
            <p className="text-2xl font-mono font-semibold text-slate-800">{formatDuration(elapsed)}</p>
          </div>
          {activeTimer ? (
            <button className="btn-danger" onClick={handleStop} disabled={busy}>
              <Square size={15} /> Stop
            </button>
          ) : (
            <button className="btn-primary" onClick={handleStart} disabled={busy}>
              <Play size={15} /> Start
            </button>
          )}
        </div>
      )}

      {status === "loading" && <Loading />}
      {status === "error" && <ErrorState onRetry={loadLogs} />}
      {status === "success" && logs.length === 0 && <EmptyState title="No time logged yet" />}
      {status === "success" && logs.length > 0 && (
        <table className="dt">
          <thead>
            <tr>
              <th>Technician</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l.id ?? i}>
                <td>{l.technicianName || l.technicianId}</td>
                <td>{formatDateTime(l.startTime || l.startedAt)}</td>
                <td>{l.endTime || l.endedAt ? formatDateTime(l.endTime || l.endedAt) : "In progress"}</td>
                <td>{l.durationMinutes != null ? `${l.durationMinutes} min` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* --------------------------------- Notes ---------------------------------- */

function NotesTab({ woId }) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const res = await workOrderApi.getNotes(woId);
      setNotes(res.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [woId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await workOrderApi.addNote(woId, { content });
      setContent("");
      load();
    } catch (err) {
      showToast(err.friendlyMessage || "Couldn't add note", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="input"
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn-primary" disabled={saving}>Post</button>
      </form>

      {status === "loading" && <Loading />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && notes.length === 0 && <EmptyState title="No notes yet" />}
      {status === "success" && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((n, i) => (
            <div key={n.id ?? i} className="border-l-2 border-brand-200 pl-3 py-1">
              <p className="text-sm text-slate-700">{n.content}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {n.authorName || n.author || "—"} · {formatDateTime(n.createdAt || n.createdDate)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
