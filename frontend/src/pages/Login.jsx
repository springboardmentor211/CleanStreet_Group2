// import { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import api from "../utils/api";
// import Navbar from "../components/Navbar";
// import { useAuth } from "../context/AuthContext";

// import "./Login.css";

// function Login() {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { updateUser } = useAuth();

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/auth/login", formData);
//       if (res.data.token) {
//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("role", res.data.user.role);
        
//         // Update user in context
//         updateUser(res.data.user);
        
//         // Check if there was a previous location the user was trying to access
//         const intendedPath = location.state?.from || "/dashboard";
//         navigate(intendedPath);
//       }
//     } catch (err) {
//       alert(err.response?.data?.msg || "Error logging in");
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="login-container">
//         <form onSubmit={handleSubmit}>
//           <h2>Login to CleanStreet</h2>
//           <input
//             name="email"
//             type="email"
//             placeholder="Email"
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             required
//           />
//           <p className="forgot-link">
//   <Link to="/forgot-password">Forgot Password?</Link>
// </p>
//           <button type="submit">Login</button>
//           <p className="redirect-text">
//             Don&apos;t have an account? <Link to="/register">Register</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);

        updateUser(res.data.user);

        const intendedPath = location.state?.from || "/dashboard";
        navigate(intendedPath);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h1 className="brand-title1">Clean Street</h1>
          <h2>Login to Clean Street</h2>
          <p className="subtitle">Login to your account to report and track street issues</p>

          {error && <p className="error-text">{error}</p>}

          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <div className="forgot-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="redirect-text">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
