import api from "./axios";

const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

export default dashboardApi;
