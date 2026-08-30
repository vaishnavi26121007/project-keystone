import api from "./axios";

const workOrderApi = {
  getAll: (params) => api.get("/work-orders", { params }),
  getById: (id) => api.get(`/work-orders/${id}`),
  getByClient: (clientId) => api.get(`/work-orders/client/${clientId}`),
  getByTechnician: (technicianId) => api.get(`/work-orders/technician/${technicianId}`),
  getOverdue: () => api.get("/work-orders/overdue"),
  create: (data) => api.post("/work-orders", data),
  // data: { clientId, siteId, assetId, description, priority, dueDate }
  assign: (id, data) => api.patch(`/work-orders/${id}/assign`, data),
  // data: { technicianId }
  updateStatus: (id, data) => api.patch(`/work-orders/${id}/status`, data),
  // data: { status }
  addPart: (id, data) => api.post(`/work-orders/${id}/parts`, data),
  // data: { partId, quantity }
  getParts: (id) => api.get(`/work-orders/${id}/parts`),
  startTimer: (id, technicianId, data) =>
    api.post(`/work-orders/${id}/timer/start/${technicianId}`, data || {}),
  stopTimer: (timeLogId) => api.post(`/work-orders/timer/${timeLogId}/stop`),
  getTimeLogs: (id) => api.get(`/work-orders/${id}/timelogs`),
  getActiveTimer: (id, technicianId) =>
    api.get(`/work-orders/${id}/timer/active/${technicianId}`, {
      validateStatus: (s) => s === 200 || s === 204,
    }),
  getNotes: (id) => api.get(`/work-orders/${id}/notes`),
  addNote: (id, data) => api.post(`/work-orders/${id}/notes`, data),
  // data: { content }
};

export default workOrderApi;
