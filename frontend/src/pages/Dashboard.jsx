
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyComplaints } from "../utils/api"; // ✅ using helper function
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // ✅ Fetch only the logged-in user's complaints
        const res = await getMyComplaints();
        const data = Array.isArray(res.data) ? res.data : [];
        setComplaints(data);

        // ✅ Calculate stats for the logged-in user
        const total = data.length;
        const pending = data.filter((c) => c.status === "received").length;
        const inReview = data.filter((c) => c.status === "in_review").length;
        const resolved = data.filter((c) => c.status === "resolved").length;

        setStats({ total, pending, inReview, resolved });
      } catch (err) {
        console.error("Error fetching user complaints:", err);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2>My Dashboard</h2>

        {/* ✅ Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-number">{stats.total}</p>
            <p className="stat-label">My Reports</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.pending}</p>
            <p className="stat-label">Pending</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.inReview}</p>
            <p className="stat-label">In Review</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.resolved}</p>
            <p className="stat-label">Resolved</p>
          </div>
        </div>

        {/* ✅ Recent Activity */}
        <div className="dashboard-content">
          <div className="activity-section">
            <h3>My Recent Reports</h3>
            {complaints.length === 0 ? (
              <p>You haven’t reported any issues yet.</p>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div
                  className="activity-item"
                  key={c._id}
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <p>
                    <strong>{c.title}</strong> —{" "}
                    <span style={{ textTransform: "capitalize" }}>
                      {c.status.replace("_", " ")}
                    </span>
                  </p>
                  <span>
                    {new Date(c.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* ✅ Quick Actions */}
          <div className="actions-section">
            <h3>Quick Actions</h3>
            <button
              onClick={() => navigate("/report-issue")}
              className="btn-primary"
            >
              ➕ Report New Issue
            </button>
            <button
              onClick={() => navigate("/view-complaints")}
              className="btn-secondary"
            >
              📋 View All Complaints
            </button>
            
            <button onClick={() => navigate("/issue-map")} className="btn-secondary">🗺 Issue MaP</button>
            <button
              onClick={() => navigate("/profile")}
              className="btn-secondary"
            >
              👤 Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
