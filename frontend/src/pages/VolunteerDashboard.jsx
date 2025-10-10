

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import "./VolunteerDashboard.css";

const ConfirmationMessageModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Success</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({ totalAssigned: 0, resolved: 0, pending: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const authHeader = { 'Authorization': `Bearer ${token}` };

      const [summaryRes, historyRes] = await Promise.all([
        fetch('http://localhost:5000/api/volunteer/summary', { headers: authHeader }),
        fetch('http://localhost:5000/api/volunteer/history', { headers: authHeader }),
      ]);

      if (!summaryRes.ok || !historyRes.ok) {
        throw new Error("Failed to fetch volunteer data.");
      }

      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();

      setSummary(summaryData);
      setHistory(historyData);
    } catch (err) {
      console.error("Error fetching volunteer data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleRowClick = (complaintId) => {
    setExpandedComplaintId(prevId => (prevId === complaintId ? null : complaintId));
  };

  const handleUpdateStatus = async (complaintId, status, notes) => {
    const endpoint = status === 'in_review' ? 'review' : 'resolve';
    const body = status === 'in_review' 
        ? { reviewNotes: "Volunteer has started reviewing this complaint." }
        : { notes: "Task completed and issue has been resolved." };
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.msg || `Failed to mark as ${status}`);
        }
        
        return await res.json();
    } catch (err) {
        console.error(`Error updating status to ${status}:`, err);
        throw err;
    }
  };

  const handleReview = async (complaintId) => {
    try {
      await handleUpdateStatus(complaintId, 'in_review');
      setConfirmMessage("Complaint status has been updated to 'In Review'.");
      setShowConfirmModal(true);
      fetchData();
      setExpandedComplaintId(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleResolve = async (complaintId, complaintTitle) => {
    try {
      await handleUpdateStatus(complaintId, 'resolved');
      setConfirmMessage(`Complaint "${complaintTitle}" has been successfully resolved!`);
      setShowConfirmModal(true);
      fetchData();
      setExpandedComplaintId(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved": return "#28a745";
      case "in_review": return "#ffc107";
      case "assigned": return "#17a2b8";
      default: return "#6c757d";
    }
  };
  
  return (
    <div className="volunteer-dashboard-page">
      <header className="volunteer-dashboard-header">
        <h1>Volunteer Dashboard</h1>
        <div className="header-actions">
            <nav className="header-nav-links">
                <span className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</span>
                <span className={`nav-link ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>My Complaints</span>
                <span className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</span>
            </nav>
            <span className="welcome-text">Welcome, {user?.name}!</span>
            <button className="refresh-btn-volunteer" onClick={fetchData} disabled={loading}>{loading ? 'Refreshing...' : '🔄'}</button>
            <button onClick={logout} className="logout-btn-volunteer">Logout</button>
        </div>
      </header>
      <main className="volunteer-dashboard-content">
        {loading ? ( <p style={{ textAlign: 'center' }}>Loading your data...</p> ) : (
            <>
                {activeTab === 'dashboard' && (
                    <section className="summary-cards-volunteer">
                      <div className="card-volunteer"><h2>{summary.totalAssigned}</h2><p>Total Assigned</p></div>
                      <div className="card-volunteer"><h2>{summary.pending}</h2><p>Pending</p></div>
                      <div className="card-volunteer"><h2>{summary.resolved}</h2><p>Resolved</p></div>
                    </section>
                )}
                {(activeTab === 'dashboard' || activeTab === 'complaints') && (
                    <section className="history-volunteer">
                      <h2>{activeTab === 'dashboard' ? 'Recent Complaints' : 'All My Complaints'}</h2>
                      <table>
                        <thead>
                          <tr><th>Title</th><th>Description</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {history.length > 0 ? (
                            history.map((c) => (
                              <React.Fragment key={c._id}>
                                <tr className="complaint-row-clickable" onClick={() => handleRowClick(c._id)}>
                                  <td>{c.title}</td>
                                  <td>{c.description.slice(0, 80)}...</td>
                                  <td><span className="status-badge-volunteer" style={{ backgroundColor: getStatusColor(c.status)}}>{c.status.replace("_", " ")}</span></td>
                                </tr>
                                {expandedComplaintId === c._id && (
                                  <tr className="expanded-row">
                                    <td colSpan="3">
                                      <div className="complaint-details-expanded">
                                        <div className="expanded-content">
                                            <p><strong>Full Description:</strong> {c.description}</p>
                                            <p><strong>Address:</strong> {c.address}</p>
                                            <p><strong>Reported By:</strong> {c.user_id?.name || 'N/A'}</p>
                                            {c.images && c.images.length > 0 && (
                                                <div className="expanded-images">
                                                    {c.images.map(img => (<img key={img} src={`http://localhost:5000/uploads/${img}`} alt={c.title} />))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="expanded-actions">
                                            {c.status === 'assigned' && (<button className="action-btn review" onClick={() => handleReview(c._id)}>Start Review</button>)}
                                            {c.status === 'in_review' && (<button className="action-btn resolve" onClick={() => handleResolve(c._id, c.title)}>Resolve</button>)}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))
                          ) : (<tr><td colSpan="3" style={{ textAlign: 'center' }}>No complaints have been assigned to you yet.</td></tr>)}
                        </tbody>
                      </table>
                    </section>
                )}
                {activeTab === 'profile' && (
                    <section className="profile-volunteer">
                        <h2>My Profile</h2>
                        <div className="profile-details">
                            <p><strong>Name:</strong> {user?.name}</p>
                            <p><strong>Email:</strong> {user?.email}</p>
                        </div>
                    </section>
                )}
            </>
        )}
      </main>
  
      <ConfirmationMessageModal
        isOpen={showConfirmModal}
        message={confirmMessage}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default VolunteerDashboard;