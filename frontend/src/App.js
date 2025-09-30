import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import ReportIssue from "./pages/ReportIssue.jsx";
import ViewComplaints from "./pages/ViewComplaints.jsx";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ForgotPassword from "./pages/ForgotPasswprd.jsx";
import "./App.css";
import 'leaflet/dist/leaflet.css';
import IssueMap from "./pages/IssuseMap.jsx";
import ComplaintDetails from "./pages/ComplaintDetails.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import VolunteerDashboard from "./pages/VolunteerDashboard.jsx";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          


          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/report-issue"
            element={
              <PrivateRoute>
                <ReportIssue />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-complaints"
            element={
              <PrivateRoute>
                <ViewComplaints />
              </PrivateRoute>
            }
          />
          <Route path="/admin-dashboard" element={
                              <PrivateRoute>
                                <AdminDashboard />
                                </PrivateRoute>
                              } />
                              
          <Route path="/volunteer-dashboard" element={
            <PrivateRoute>
              <VolunteerDashboard />
              </PrivateRoute>
            } />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/issue-map" element={<IssueMap />} />
          
          <Route path="*" element={<Homepage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
