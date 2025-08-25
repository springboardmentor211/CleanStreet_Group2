import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // check if user is logged in

  if (!token) {
    // user not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // user logged in, render the protected page
  return children;
};

export default PrivateRoute;
