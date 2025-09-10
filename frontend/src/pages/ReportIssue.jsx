

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './ReportIssue.css';
import SearchableMap from './SearchableMap';

const issueTypes = [
  { value: "pothole", label: "Pothole" },
  { value: "streetlight", label: "Street Light Issues" },
  { value: "garbage_dump", label: "Garbage Dump" },
  { value: "water_leak", label: "Water Leak" },
  { value: "broken_sidewalk", label: "Broken Sidewalk" },
  { value: "graffiti", label: "Graffiti" },
  { value: "noise_pollution", label: "Noise Pollution" },
  { value: "other", label: "Other" }
];

function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    issueType: '',
    priority: 'low',
    address: '',
    landmark: '',
    description: '',
    location: ''
  });

  // Store images with preview
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataWithFiles = new FormData();
      Object.keys(formData).forEach(key => {
        formDataWithFiles.append(key, formData[key]);
      });
      images.forEach(imgObj => {
        formDataWithFiles.append('images', imgObj.file);
      });

      await api.post('/api/complaints', formDataWithFiles, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});


      alert('Issue reported successfully!');
      navigate('/view-complaints');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error reporting issue');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="report-page">
        <div className="report-container">
          <h2>Report a Civic Issue</h2>
          <form onSubmit={handleSubmit} className="report-form">

            {/* Issue Title */}
            <div className="form-group">
              <label htmlFor="title">Issue Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            {/* Issue Type */}
            <div className="form-group">
              <label htmlFor="issueType">Issue Type</label>
              <select
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
              >
                <option value="">Select issue type</option>
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
                required
              />
            </div>

            {/* Nearby Landmark
            <div className="form-group">
              <label htmlFor="landmark">Nearby Landmark (Optional)</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near City Hall"
              />
            </div> */}

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            {/* Location on Map */}
            <div className="form-group">
              <label htmlFor="location">Location on Map</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                readOnly
                placeholder="Selected area will appear here"
                required
              />
              <SearchableMap
                location={formData.location}
                setLocation={(loc) => setFormData({ ...formData, location: loc })}
              />
            </div>

            {/* Upload Images */}
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                capture="environment"
              />

              {/* Image Previews */}
              <div className="image-preview-container">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-wrapper">
                    <img
                      src={img.preview}
                      alt={`preview-${index}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-button">Submit Report</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
