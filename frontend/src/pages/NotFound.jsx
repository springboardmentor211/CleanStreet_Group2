import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="notfound-container" style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <button onClick={() => navigate("/")} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Go to Homepage
        </button>
      </div>
    </div>
  );
}

export default NotFound;
