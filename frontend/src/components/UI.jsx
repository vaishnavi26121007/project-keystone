import { createContext, useCallback, useContext, useState } from "react";
import { Loader2, Inbox, AlertTriangle, X, CheckCircle2, XCircle } from "lucide-react";

/* ---------------------------- Toast system ---------------------------- */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm shadow-lg text-white ${
              t.type === "success"
                ? "bg-emerald-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-slate-800"
            }`}
          >
            {t.type === "success" && <CheckCircle2 size={16} />}
            {t.type === "error" && <XCircle size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/* ------------------------------- States -------------------------------- */

export function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
      <Loader2 className="animate-spin" size={18} />
      {label}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
      <Inbox size={32} className="mb-3 text-slate-300" />
      <p className="font-medium text-slate-600">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle size={32} className="mb-3 text-red-400" />
      <p className="font-medium text-red-600">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle size={32} className="mb-3 text-amber-500" />
      <p className="font-medium text-slate-700">Access denied</p>
      <p className="text-sm text-slate-500 mt-1">
        You don't have permission to view this page.
      </p>
    </div>
  );
}

/* -------------------------------- Badges -------------------------------- */

const STATUS_STYLES = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  ON_HOLD: "bg-slate-200 text-slate-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  BUSY: "bg-amber-100 text-amber-700",
  UNAVAILABLE: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ value }) {
  if (!value) return <span className="text-slate-400 text-xs">—</span>;
  const style = STATUS_STYLES[value] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {String(value).replaceAll("_", " ")}
    </span>
  );
}

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export function PriorityBadge({ value }) {
  if (!value) return <span className="text-slate-400 text-xs">—</span>;
  const style = PRIORITY_STYLES[value] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {value}
    </span>
  );
}

/* -------------------------------- Modal --------------------------------- */

export function Modal({ open, onClose, title, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title = "Are you sure?", message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
            Confirm
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
