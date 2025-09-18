
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ComplaintDetails.css";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/complaints/${id}`)
      .then(res => setComplaint(res.data))
      .catch(err => console.error("Error fetching complaint:", err));
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // 🔥 Voting for complaint
  const handleComplaintVote = async (voteType) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${id}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(prev => ({
        ...prev,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes
      }));
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  

  if (!complaint) return <p>Loading...</p>;

  return (
    <div className="complaint-details">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="complaint-card">
        <h2>{complaint.title}</h2>
        <p><strong>Status:</strong> {complaint.status}</p>
        <p><strong>Description:</strong> {complaint.description}</p>
        <p><strong>Address:</strong> {complaint.address}</p>
        
        {complaint.images?.length > 0 && (
          <img
            src={`http://localhost:5000/uploads/${complaint.images[0]}`}
            alt="Complaint"
            className="complaint-image"
          />
        )}

        {/* 🔥 Complaint Voting */}
        <div className="vote-section">
          <button onClick={() => handleComplaintVote("upvote")} className="vote-btn">👍 {complaint.upvotes}</button>
          <button onClick={() => handleComplaintVote("downvote")} className="vote-btn">👎 {complaint.downvotes}</button>
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {complaint.comments?.length > 0 ? (
          complaint.comments.map((comment) => (
            <div key={comment._id} className="comment">
              <strong>{comment.author}:</strong> {comment.text}
              <div className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
             
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        <div className="comment-input">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={handleCommentSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
}
