import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './ReportIssue.css';

function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'low'
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataWithFiles = new FormData();
      Object.keys(formData).forEach(key => {
        formDataWithFiles.append(key, formData[key]);
      });
      images.forEach(image => {
        formDataWithFiles.append('images', image);
      });

      await api.post('/complaints', formDataWithFiles, {
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
          <h2>Report an Issue</h2>
          <form onSubmit={handleSubmit} className="report-form">
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

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Where is this issue located?"
                required
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
            </div>

            <button type="submit" className="submit-button">Submit Report</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
