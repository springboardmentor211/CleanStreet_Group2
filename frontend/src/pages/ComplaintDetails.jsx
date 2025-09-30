

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { getAdminVolunteers, assignComplaint } from "../utils/api";
import "./ComplaintDetails.css";
import { ArrowLeft,  ThumbsDown, ThumbsUp } from "lucide-react"; 

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");

  useEffect(() => {
    api.get(`/api/complaints/${id}`)
      .then(res => setComplaint(res.data))
      .catch(err => console.error("Error fetching complaint:", err));
    
    if (user && user.role === 'admin') {
        getAdminVolunteers()
            .then(res => setVolunteers(res.data || []))
            .catch(err => console.error("Error fetching volunteers:", err));
    }
  }, [id, user]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/api/complaints/${id}/comment`, { text: newComment });
      setComplaint(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleComplaintVote = async (voteType) => {
    try {
      const res = await api.post(`/api/complaints/${id}/vote`, { voteType });
      setComplaint(prev => ({
        ...prev,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes
      }));
    } catch (err) {
      console.error("Error voting:", err);
    }
  };
  
  const handleAssign = async () => {
      if (!selectedVolunteer) {
          alert("Please select a volunteer to assign.");
          return;
      }
      try {
          const updatedComplaint = await assignComplaint(id, selectedVolunteer);
          setComplaint(updatedComplaint.data);
          alert("Complaint assigned successfully!");
      } catch (err) {
          console.error("Error assigning complaint:", err);
          alert("Failed to assign complaint.");
      }
  };

  if (!complaint) return <div className="loading-container">Loading Complaint Details...</div>;

  const showEngagement = complaint.upvotes > 0 || complaint.downvotes > 0;
  const showComments = complaint.comments && complaint.comments.length > 0;

  return (
    <div className="complaint-details-page">
      <div className="complaint-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back to List
        </button>
        
        <div className="details-grid">
          
          <div className="complaint-content-card">
            {complaint.images?.length > 0 && (
              <div className="complaint-gallery">
                {complaint.images.map(img => (
                    <img
                      key={img}
                      src={`http://localhost:5000/uploads/${img}`}
                      alt="Complaint visualization"
                    />
                ))}
              </div>
            )}
            <div className="complaint-info-body">
              <h1>{complaint.title}</h1>
              <p className="complaint-description">{complaint.description}</p>
            </div>
          </div>

         
          <div className="complaint-sidebar-card">
            <div className="sidebar-section">
              <h3>Details</h3>
              <div className="metadata-item">
                <span className="label">Status</span>
                <span className={`value status-badge status-${complaint.status}`}>{complaint.status.replace("_", " ")}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Reported By</span>
                <span className="value">{complaint.user_id?.name || 'N/A'}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Assigned To</span>
                <span className="value">{complaint.assigned_to?.name || 'Unassigned'}</span>
              </div>
               <div className="metadata-item">
                <span className="label">Address</span>
                <span className="value">{complaint.address || 'Not Provided'}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Date Reported</span>
                <span className="value">{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            
            {showEngagement && (
              <div className="sidebar-section">
                <h3>Engagement</h3>
                <div className="votes-display">
                  <span className="vote-item"><ThumbsUp size={18} /> {complaint.upvotes}</span>
                  <span className="vote-item"><ThumbsDown size={18} /> {complaint.downvotes}</span>
                </div>
              </div>
            )}

            
            {showComments && (
              <div className="sidebar-section">
                <h3>Comments ({complaint.comments.length})</h3>
                {complaint.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

         
          <div className="action-card">
           
            {user?.role === 'admin' && complaint.status === 'received' && (
                <div className="sidebar-section">
                    <h3>Assign to Volunteer</h3>
                    <div className="action-controls">
                        <select value={selectedVolunteer} onChange={e => setSelectedVolunteer(e.target.value)}>
                            <option value="">-- Select a Volunteer --</option>
                            {volunteers.map(v => (
                                <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                            ))}
                        </select>
                        <button onClick={handleAssign}>Assign</button>
                    </div>
                </div>
            )}

          
            {user?.role !== 'admin' && (
              <div className="sidebar-section">
                <h3>Your Feedback</h3>
                <div className="action-controls" style={{ marginBottom: '1rem' }}>
                    <button onClick={() => handleComplaintVote("upvote")} style={{flex: 1, background: '#e0e7ff', color: '#4338ca'}}>
                      <ThumbsUp size={16} style={{marginRight: '0.5rem'}}/> Upvote ({complaint.upvotes})
                    </button>
                    <button onClick={() => handleComplaintVote("downvote")} style={{flex: 1, background: '#fee2e2', color: '#b91c1c'}}>
                      <ThumbsDown size={16} style={{marginRight: '0.5rem'}}/> Downvote ({complaint.downvotes})
                    </button>
                </div>
                <div className="action-controls">
                  <input
                    type="text"
                    placeholder="Add a public comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button onClick={handleCommentSubmit}>Post</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}