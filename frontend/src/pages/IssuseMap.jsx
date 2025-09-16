import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import "leaflet/dist/leaflet.css";

const issueTypeColors = {
  pothole: "#8B4513",         // brown
  streetlight: "#FFD700",     // yellow
  garbage_dump: "#FF4500",    // orange
  water_leak: "#1E90FF",      // blue
  broken_sidewalk: "#A0522D", // sienna
  graffiti: "#800080",        // purple
  noise_pollution: "#FF1493", // pink
  other: "#32CD32",           // green
};

function IssueMap() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/api/complaints");
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar on top */}
      <Navbar />

      {/* Map below */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[20.5937, 78.9629]} // India
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {complaints.map((c) =>
            c.location?.coordinates ? (
              <CircleMarker
                key={c._id}
                center={[
                  c.location.coordinates[1], // lat
                  c.location.coordinates[0], // lng
                ]}
                radius={10}
                color={issueTypeColors[c.issueType] || "#000"}
                fillColor={issueTypeColors[c.issueType] || "#000"}
                fillOpacity={0.7}
              >
                {/* 🟢 Tooltip shows on hover */}
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div>
                    <strong>{c.title}</strong>
                    <br />
                    {c.address || "No address"}
                  </div>
                </Tooltip>

                {/* Popup still available on click */}
                <Popup>
                  <div
                    style={{
                      minWidth: "220px",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#fff",
                      boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: "16px",
                        color: "#1f2937",
                      }}
                    >
                      {c.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        margin: "0 0 8px",
                        color: "#4b5563",
                      }}
                    >
                      {c.description.length > 100
                        ? c.description.slice(0, 100) + "..."
                        : c.description}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: "0 0 8px",
                        color: "#6b7280",
                      }}
                    >
                      <strong>Type:</strong> {c.issueType} <br />
                      <strong>Priority:</strong> {c.priority} <br />
                      <strong>Status:</strong> {c.status}
                    </p>
                    <button
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/complaints/${c._id}`)}
                    >
                      View Details →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default IssueMap;
