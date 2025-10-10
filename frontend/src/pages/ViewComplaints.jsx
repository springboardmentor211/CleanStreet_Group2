


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext"; 
import "./ViewComplaints.css";
import { FaMapMarkerAlt, FaCalendarAlt, FaTrash } from 'react-icons/fa';

function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/api/complaints");
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved": return "#10B981";
      case "in_review": return "#F59E0B";
      case "assigned": return "#3B82F6";
      default: return "#6B7280";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await api.delete(`/api/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (activeFilter === "all") {
      return true;
    }
    return complaint.status.replace('_', '-') === activeFilter;
  });

  const filterOptions = ["all", "received", "assigned", "in-review", "resolved"];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="view-complaints-page"><div className="loading">Loading...</div></div>
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
              Showing {filteredComplaints.length} of {complaints.length} reports
            </p>
          </div>

          {/* --- NEW: Dropdown Filter UI --- */}
          <div className="filter-dropdown-container">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              className="filter-dropdown"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              {filterOptions.map(option => (
                <option key={option} value={option}>
                  
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {complaints.length > 0 && filteredComplaints.length === 0 ? (
            <div className="no-complaints">
              <h3>No complaints match the filter "{activeFilter.replace('-', ' ')}"</h3>
            </div>
          ) : (
            <div className="complaints-grid">
              {filteredComplaints.map((complaint) => (
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
                      {complaint.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="complaint-meta">
                    <span><FaMapMarkerAlt /> {complaint.address || "Unknown Location"}</span>
                    <span><FaCalendarAlt />
                      {" "}
                      {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
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
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${img}`}
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
                      onClick={(e) => { e.stopPropagation(); handleDelete(complaint._id); }}
                    >
                      <FaTrash />
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