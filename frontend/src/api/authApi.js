import api from "./axios";

// NOTE: exact field names for RegisterRequest/LoginRequest/AuthResponse were
// not provided in the spec — these are the common Spring Boot conventions.
// If your backend uses different field names, adjust the payloads below.
const authApi = {
  register: (data) => api.post("/auth/register", data),
  // data: { fullName, email, password, role }
  login: (data) => api.post("/auth/login", data),
  // data: { email, password }
  // expected AuthResponse shape: { token, role, userId, fullName/name, email }
};

export default authApi;
