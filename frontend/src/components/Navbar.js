
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
};


function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true); 
  };
  
  const handleConfirmLogout = () => {
    logout(); 
    setIsLogoutModalOpen(false);
    // navigate("/");
    window.location.href = '/'; 
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">CleanStreet</Link>
        </div>
        <ul className="navbar-links">
          {user && ( 
            <>
              <li><NavLink to="/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/report-issue">Report Issue</NavLink></li>
              <li><NavLink to="/view-complaints">View Complaints</NavLink></li>
            </>
          )}
        </ul>
        <div className="navbar-buttons">
          {user ? (
            <>
              <button
                className="profile-icon-btn"
                title="Edit Profile"
                onClick={() => navigate("/profile")}
              >
                👤
              </button>
              <button onClick={handleLogoutClick} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </nav>
      
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </>
  );
}

export default Navbar;

