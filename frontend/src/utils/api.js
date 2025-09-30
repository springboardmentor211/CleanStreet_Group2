
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Interceptors 
// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/homepage";
    }
    return Promise.reject(error);
  }
);

// ---------------- AUTH ----------------
export const loginUser = (data) => api.post("/api/auth/login", data);
export const registerUser = (data) => api.post("/api/auth/register", data);

// ---------------- USERS (Profile, etc.) ----------------
export const getUserSummary = () => api.get("/api/users/summary");
export const getMyComplaints = () => api.get("/api/complaints/my");

// ---------------- COMPLAINTS (General Actions) ----------------
export const addComplaint = (data) => api.post("/api/complaints", data);
export const deleteComplaint = (id) => api.delete(`/api/complaints/${id}`);
export const addComment = (complaintId, text) => api.post(`/api/complaints/${complaintId}/comment`, { text });
export const voteComplaint = (complaintId, voteType) => api.post(`/api/complaints/${complaintId}/vote`, { voteType });
export const voteComment = (complaintId, commentId, voteType) => api.post(`/api/complaints/${complaintId}/comments/${commentId}/vote`, { voteType });

// ---------------- WORKFLOW (Admin & Volunteer Actions) ----------------
export const assignComplaint = (id, volunteerId) => api.put(`/api/complaints/${id}/assign`, { volunteerId });
export const volunteerReview = (id, reviewNotes) => api.put(`/api/complaints/${id}/review`, { reviewNotes });
export const resolveComplaint = (id, notes) => api.put(`/api/complaints/${id}/resolve`, { notes });

// ---------------- ADMIN DASHBOARD ----------------
export const getAdminSummary = () => api.get("/api/admin/summary");
export const getAllComplaints = (status = "all") => api.get("/api/admin/complaints", { params: status !== "all" ? { status } : {} });
export const getAllUsers = () => api.get("/api/admin/users");
export const getAdminVolunteers = () => api.get("/api/admin/volunteers");
export const getAdminActivityLog = () => api.get("/api/admin/activity-log");
export const deleteComplaintByAdmin = (id) => api.delete(`/api/admin/complaints/${id}`);
export const getComplaintPrioritySummary = () => api.get('/api/admin/summary/priority');
export const getMonthlyComplaintSummary = () => api.get('/api/admin/summary/monthly');
export const getIssueTypeSummary = () => api.get("/api/admin/issue-type-summary");
export const getUserDetails = (userId) => api.get(`/api/admin/users/${userId}/details`);
export const getAdminUsersSummary = () => api.get("/api/admin/users/summary");
export const getReportsSummary = () => api.get("/api/admin/reports/summary");
export const getCategoryBreakdown = () => api.get("/api/admin/reports/category-breakdown");
export const logReportDownload = () => api.post("/api/admin/reports/log-download");
export const exportExcelReport = () => api.get("/api/admin/reports/export-excel", { responseType: 'blob' });


// ---------------- VOLUNTEER DASHBOARD ----------------
export const getVolunteerSummary = () => api.get(`/api/volunteer/summary`);
export const getVolunteerHistory = () => api.get(`/api/volunteer/history`);

export default api;