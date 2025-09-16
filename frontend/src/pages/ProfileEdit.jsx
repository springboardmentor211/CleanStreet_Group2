import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewPic, setPreviewPic] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  console.log('Current user from context:', user);
  console.log('Current editedUser state:', editedUser);

  // Update local state when user data changes
  useEffect(() => {
    console.log('User data changed in context:', user);
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  // Log when editedUser changes
  useEffect(() => {
    console.log('EditedUser state updated:', editedUser);
  }, [editedUser]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewPic(URL.createObjectURL(file)); // preview image
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      // const res = await api.post("/users/uploads-profile-picture", formData);
       const res = await api.post("/api/users/uploads-profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
      updateUser({ ...user, profilePicture: res.data.url });
      setPreviewPic(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    try {
      console.log('Sending request to remove profile picture...');
      const response = await api.delete("/api/users/me/profile-picture");
      console.log('Received response:', response);
      
      if (response.data) {
        console.log('Setting new user data:', response.data);
        updateUser(response.data);
        setError(null); // Clear any existing errors
      } else {
        console.error('Empty response received');
        setError("Server response was empty. Please try again.");
      }
    } catch (err) {
      console.error('Error removing profile picture:', err.response || err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to remove profile picture. Please try again.";
      setError(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'email' || name === 'username' || name === 'phone') {
      processedValue = value.trim();
    }

    setEditedUser(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!editedUser.name?.trim()) {
      setError("Name is required");
      return false;
    }
    if (!editedUser.username?.trim()) {
      setError("Username is required");
      return false;
    }
    if (!editedUser.email?.trim()) {
      setError("Email is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    // Basic phone validation if provided
    if (editedUser.phone && !/^\+?[\d\s-]{10,}$/.test(editedUser.phone)) {
      setError("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Clean and prepare update data
      const updateData = {
        name: editedUser.name.trim(),
        username: editedUser.username.trim(),
        email: editedUser.email.trim(),
        phone: editedUser.phone?.trim() || '',
        address: editedUser.address?.trim() || '',
        bio: editedUser.bio?.trim() || ''
      };
      
      console.log('Cleaned update data to be sent:', updateData);
      
      const response = await api.put("/api/users/me", updateData);
      console.log('Server response:', response.data);
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      // Update the global context with the new data
      updateUser(response.data);
      
      // Update local state
      setEditedUser(response.data);
      setIsEditing(false);
      setError(null);
      
      // Show success message without using alert
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = 'Profile updated successfully!';
      document.querySelector('.profile-wrapper').appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      "Failed to update profile. Please try again.";
      setError(errorMsg);
      
      // Scroll error into view
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-container">
          <div className="profile-wrapper">
            <p className="loading">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-content">
            {/* LEFT PROFILE CARD */}
            <div className="profile-sidebar">
              <div className="profile-picture-container">
                {previewPic || editedUser?.profilePicture ? (
                  <img
                    src={previewPic || editedUser?.profilePicture}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture default-avatar">
                    {editedUser?.name ? editedUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="profile-picture-actions">
                  <div
                    className="profile-picture-edit"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload new picture"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12z"/>
                    </svg>
                  </div>
                  {(user?.profilePicture || previewPic) && (
                    <div
                      className="profile-picture-remove"
                      onClick={handleRemovePicture}
                      title="Remove picture"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>

              <div className="profile-info">
                <h3>{editedUser?.name || "User Name"}</h3>
                <p className="profile-username">@{editedUser?.username || "username"}</p>
                <p className="profile-bio">{editedUser?.bio || "No bio yet"}</p>
                <span className="profile-role">Citizen</span>
                <p className="member-since">
                  Member since{" "}
                  {editedUser?.createdAt
                    ? new Date(editedUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* RIGHT INFO PANEL */}
            <div className="profile-details-section">
              <h2>Account Information</h2>

              {!isEditing ? (
                <div className="details-view">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{editedUser?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">@{editedUser?.username}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bio:</span>
                    <span className="detail-value">{editedUser?.bio || "No bio added"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{editedUser?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{editedUser?.phone || "Not provided"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{editedUser?.address || "Not provided"}</span>
                  </div>

                  <button
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit Information
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="edit-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      value={editedUser?.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      name="username"
                      value={editedUser?.username || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={editedUser?.bio || ""}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedUser?.email || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={editedUser?.phone || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={editedUser?.address || ""}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
