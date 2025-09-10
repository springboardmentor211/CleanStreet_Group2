
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/api/complaints/my");
        setComplaints(res.data);

        const total = res.data.length;
        const pending = res.data.filter(
          (c) => c.status === "pending" || c.status === "received"
        ).length;
        const inProgress = res.data.filter(
          (c) => c.status === "in_progress"
        ).length;
        const resolved = res.data.filter(
          (c) => c.status === "resolved"
        ).length;

        setStats({ total, pending, inProgress, resolved });
      } catch (err) {
        console.error("Error fetching complaints:", err.response?.data || err.message);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2>Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-number">{stats.total}</p>
            <p className="stat-label">Total Issues</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.pending}</p>
            <p className="stat-label">Pending</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.inProgress}</p>
            <p className="stat-label">In Progress</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.resolved}</p>
            <p className="stat-label">Resolved</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="activity-section">
            <h3>Recent Activity</h3>
            {complaints.length === 0 ? (
              <p>No complaints yet.</p>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div className="activity-item" key={c._id}>
                  <p><strong>{c.title}</strong> - {c.status}</p>
                  <span>{new Date(c.updatedAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="actions-section">
            <h3>Quick Actions</h3>
            <button onClick={() => navigate('/report-issue')} className="btn-primary">➕ Report New Issue</button>
            <button onClick={() => navigate('/view-complaints')} className="btn-secondary">📋 View All Complaints</button>
            <button className="btn-secondary">🗺 Issue Map</button>
            <button onClick={() => navigate('/profile')} className="btn-secondary">
              👤 Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
