
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // backend URL
});

// 🔹 Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Auto-logout on 401 (invalid/expired token)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);



// Complaints
export const getAllComplaints = () => api.get("/api/complaints");
export const getMyComplaints = () => api.get("/api/complaints/my");
export const addComplaint = (data) => api.post("/api/complaints", data);

// Voting
export const voteComplaint = (complaintId, voteType) =>
  api.post(`/api/complaints/${complaintId}/vote`, { voteType });

export const voteComment = (complaintId, commentId, voteType) =>
  api.post(`/api/complaints/${complaintId}/comments/${commentId}/vote`, { voteType });

// Comments
export const addComment = (complaintId, text) =>
  api.post(`/api/complaints/${complaintId}/comment`, { text });

export default api;
