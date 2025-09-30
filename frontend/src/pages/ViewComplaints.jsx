import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext"; 
import "./ViewComplaints.css";

function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth(); 
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/api/complaints");
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err.response?.data || err.message);
        alert("Error fetching complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "#38A169"; // green
      case "in_review":
        return "#D69E2E"; // yellow
      default:
        return "#E53E3E"; // red
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await api.delete(`/api/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Error deleting complaint");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="view-complaints-page">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="view-complaints-page">
        <div className="complaints-container">
          <div className="page-header">
            <h2>Community Reports</h2>
            <p className="complaints-count">
              {complaints.length} {complaints.length === 1 ? "complaint" : "complaints"} reported
            </p>
          </div>

          {complaints.length === 0 ? (
            <div className="no-complaints">
              <div className="no-complaints-icon">📋</div>
              <h3>No Complaints Yet</h3>
              <p>No complaints have been reported yet.</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="complaint-card"
                  onClick={() => navigate(`/complaints/${complaint._id}`)}
                >
                  
                  <div className="complaint-card-header">
                    <h3>{complaint.title}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  
                  <div className="complaint-meta">
                    <span>📍 {complaint.address || "Unknown Location"}</span>
                    <span>
                      🕒{" "}
                      {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="complaint-description">
                    {complaint.description.length > 120
                      ? complaint.description.slice(0, 120) + "..."
                      : complaint.description}
                  </p>

                 
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="complaint-images-preview">
                      {complaint.images.slice(0, 2).map((img, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000/uploads/${img}`}
                          alt={`complaint-${idx}`}
                          className="complaint-thumb"
                        />
                      ))}
                      {complaint.images.length > 2 && (
                        <span className="more-images">+{complaint.images.length - 2} more</span>
                      )}
                    </div>
                  )}

                
                  {user && complaint.user_id === user.id && (
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(complaint._id);
                      }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewComplaints;
