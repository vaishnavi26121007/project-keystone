import api from "./axios";

const clientApi = {
  getAll: () => api.get("/clients"),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post("/clients", data),
  // data: { companyName, contactEmail, contactPhone, billingAddress, slaTier }
  update: (id, data) => api.put(`/clients/${id}`, data),
  remove: (id) => api.delete(`/clients/${id}`),
};

export default clientApi;
