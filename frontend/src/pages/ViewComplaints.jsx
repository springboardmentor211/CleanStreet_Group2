import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './ViewComplaints.css';

function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/api/complaints/my');
        setComplaints(res.data);
      } catch (err) {
        console.error('Error details:', err.response?.data || err.message);
        alert('Error fetching complaints. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#38A169';
      case 'in_progress':
        return '#D69E2E';
      default:
        return '#E53E3E';
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
          <h2>Your Complaints</h2>
          
          {complaints.length === 0 ? (
            <div className="no-complaints">
              <p>You haven't reported any issues yet.</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card">
                  <div 
                    className="status-indicator" 
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  />
                  <h3>{complaint.title}</h3>
                  <p className="location">{complaint.location}</p>
                  <p className="description">{complaint.description}</p>
                  <div className="complaint-footer">
                    <span className="status">Status: {complaint.status}</span>
                    <span className="date">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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
