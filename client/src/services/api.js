import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bloodcare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    window.dispatchEvent(
      new CustomEvent("bloodcare:toast", {
        detail: {
          type: "error",
          message: error.response?.data?.message || "Something went wrong.",
        },
      }),
    );
    if (error.response?.status === 401) {
      localStorage.removeItem("bloodcare_token");
      localStorage.removeItem("bloodcare_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
