import api from "./axios";

const partApi = {
  getAll: () => api.get("/parts"),
  getLowStock: () => api.get("/parts/low-stock"),
  create: (data) => api.post("/parts", data),
  // data: { name, sku, unitCost, quantity, reorderThreshold }
  update: (id, data) => api.put(`/parts/${id}`, data),
};

export default partApi;
