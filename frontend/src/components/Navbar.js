import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-link">CleanStreet</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/report-issue">Report Issue</Link></li>
        <li><Link to="/view-complaints">View Complaints</Link></li>
      </ul>
      <div className="navbar-buttons">
        <Link to="/login" className="btn btn-outline">Login</Link>
        <Link to="/register" className="btn btn-primary">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
