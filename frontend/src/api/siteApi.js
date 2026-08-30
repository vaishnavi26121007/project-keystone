
import api from "./axios";

const siteApi = {
  getAll: () =>
    api.get("/sites"),

  getByClient: (clientId) =>
    api.get(`/sites/client/${clientId}`),

  create: (data) =>
    api.post("/sites", {
      name: data.name,
      address: data.address,
      city: data.city || null,
      state: data.state || null,
      postalCode: data.postalCode || null,
      clientId: Number(data.clientId),
    }),

  remove: (id) =>
    api.delete(`/sites/${id}`),
};

export default siteApi;
