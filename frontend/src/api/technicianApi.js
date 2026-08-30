import api from "./axios";

const technicianApi = {
  getAll: () => api.get("/technicians"),
  getAvailable: () => api.get("/technicians/available"),
  getByUser: (userId) => api.get(`/technicians/by-user/${userId}`),
  updateAvailability: (id, status) =>
    api.patch(`/technicians/${id}/availability`, null, { params: { status } }),
};

export default technicianApi;
