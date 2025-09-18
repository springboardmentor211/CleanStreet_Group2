import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinedDate: '',
    profilePicture: '',  
    complaints: {
      total: 0,
      resolved: 0,
      pending: 0
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // const response = await api.get('/users/profile');
        const response = await api.get('/users/me'); 
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.profilePicture  ? (
                // <img src={user.avatar} alt={user.name} />
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                getInitials(user.name || 'User Name')
              )}
            </div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h2 className="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Personal Information
              </h2>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{user.address || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">{formatDate(user.joinedDate)}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
                </svg>
                Activity Summary
              </h2>
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-value">{user.complaints.total}</div>
                  <div className="stat-label">Total Reports</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{user.complaints.resolved}</div>
                  <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{user.complaints.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>

            <button 
              className="edit-button"
              onClick={() => navigate('/profile/edit')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;