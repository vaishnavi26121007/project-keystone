import axios from "axios";

// Central Axios instance. Base URL is read from the environment only —
// never hardcode the backend URL anywhere else in the app.
const api = axios.create({
  baseURL: "https://project-keystone-o9rh.onrender.com/api",
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("keystone_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into a simple, human-readable shape so pages don't
// each have to re-implement this.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong. Please try again.";
    if (!error.response) {
      message = "Can't reach the server. Check your connection or the API URL.";
    } else {
      const { status, data } = error.response;
      const backendMessage =
        (data && (data.message || data.error || data.detail)) || null;
      if (status === 400) message = backendMessage || "Invalid request.";
      else if (status === 401) message = "Your session has expired. Please log in again.";
      else if (status === 403) message = "You don't have permission to do that.";
      else if (status === 404) message = backendMessage || "Not found.";
      else if (status === 409) message = backendMessage || "This conflicts with existing data.";
      else if (status >= 500) message = "Server error. Please try again shortly.";
      else message = backendMessage || message;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("keystone_token");
      localStorage.removeItem("keystone_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export default api;
