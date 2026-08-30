import api from "./axios";

const assetApi = {
  getBySite: (siteId) => api.get(`/assets/site/${siteId}`),
  create: (data) => api.post("/assets", data),
  // data: { assetName, model, serialNumber, siteId } — adjust to match your Asset DTO
  remove: (id) => api.delete(`/assets/${id}`),
};

export default assetApi;
