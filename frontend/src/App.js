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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Catch-all → send to homepage */}
          <Route path="*" element={<Homepage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
