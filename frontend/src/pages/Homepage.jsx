import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();

  // Remove the auto-redirect to login as homepage should be accessible to all users

  const handleReportIssue = () => {
    navigate("/report-issue");
  };

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">CleanStreet</Link>
        </div>
        <div className="navbar-middle">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/report-issue">Report Issue</Link>
          <Link to="/view-complaints">View Complaints</Link>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/register" className="btn-register">Register</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1>Build a Cleaner Community</h1>
          <p>Empower your city with tools to report issues, track progress, and unite for change.</p>
          <button onClick={handleReportIssue} className="btn-report">
            + Report an Issue
          </button>
          <Link to="/view-complaints" className="btn-view">
            View Reports
          </Link>
        </div>
      </header>

      <section className="how-it-works">
        <h2>How CleanStreet Works</h2>
        <div className="features">
          <div className="feature">
            <span role="img" aria-label="report">🌱</span>
            <h3>Report Issues</h3>
            <p>Submit civic concerns with photos and location details effortlessly.</p>
          </div>
          <div className="feature">
            <span role="img" aria-label="track">📊</span>
            <h3>Track Progress</h3>
            <p>Follow the status of reported issues with real-time updates.</p>
          </div>
          <div className="feature">
            <span role="img" aria-label="community">🤝</span>
            <h3>Community Action</h3>
            <p>Vote and comment to prioritize and support community needs.</p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Report a Civic Issue</h2>
        <form className="issue-form">
          <div className="form-group">
            <label>Issue Title</label>
            <input type="text" placeholder="Brief description of the issue" />
          </div>
          <div className="form-group">
            <label>Priority Level</label>
            <select>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="Enter street address" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Describe the issue in detail..."></textarea>
          </div>
          <div className="form-group">
            <label>Location Map</label>
            <div style={{ height: "200px", backgroundColor: "#e0e7e9" }}>
              {/* Placeholder for map */}
            </div>
          </div>
          <button type="submit" className="btn-submit">
            Submit Report
          </button>
        </form>
      </section>

      <footer>
        <p>&copy; 2025 CleanStreet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;