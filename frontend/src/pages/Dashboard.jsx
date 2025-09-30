
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserSummary, getMyComplaints } from "../utils/api";
import "./Dashboard.css";

// Progress Bar 
const ComplaintProgressBar = ({ status }) => {
  const stages = ['received', 'assigned', 'in_review', 'resolved'];
  const currentIndex = stages.indexOf(status);
  
  let colorClass = 'blue';
  if (status === 'in_review') colorClass = 'orange';
  if (status === 'resolved') colorClass = 'green';
  if (status === 'received') colorClass = 'grey';

  const progressPercentage = currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <div className="progress-bar-stages">
        {stages.map((stage, index) => (
          <div key={stage} className="stage">
            <div className={`stage-node ${index <= currentIndex ? `completed ${stages[index]}` : ''}`}></div>
            <p className={`stage-label ${index <= currentIndex ? 'active' : ''}`}>
              {stage.replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


// Main Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    received: 0,
    assigned: 0,
    in_review: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, complaintsRes] = await Promise.all([
          getUserSummary(),
          getMyComplaints(),
        ]);
        setStats(summaryRes.data);
        const complaintsData = Array.isArray(complaintsRes.data) ? complaintsRes.data : [];
        setComplaints(complaintsData);
      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2>My Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-number">{stats.total}</p>
            <p className="stat-label">My Reports</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.received}</p>
            <p className="stat-label">Pending</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.assigned}</p>
            <p className="stat-label">Assigned</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.in_review}</p>
            <p className="stat-label">In Review</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.resolved}</p>
            <p className="stat-label">Resolved</p>
          </div>
        </div>

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
                >
                  <div className="activity-item-header">
                    <p><strong>{c.title}</strong></p>
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <ComplaintProgressBar status={c.status} />
                </div>
              ))
            )}
          </div>

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
            <button onClick={() => navigate("/issue-map")} className="btn-secondary">
              🗺 Issue Map
            </button>
           
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