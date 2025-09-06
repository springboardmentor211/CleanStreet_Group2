// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../utils/api";
// import Navbar from "../components/Navbar";   // ✅ Import Navbar
// import "../styles/theme.css";

// function Register() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     location: "",
//     role: "user"
//   });
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       setProfilePhoto(file);
//     } else {
//       alert('Please select an image file');
//       e.target.value = null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const submitData = new FormData();
//       Object.keys(formData).forEach(key => {
//         submitData.append(key, formData[key]);
//       });
//       if (profilePhoto) {
//         submitData.append('profilePhoto', profilePhoto);
//       }

//       await api.post("/auth/register", submitData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       alert("Registration successful! Please login.");
//       navigate("/login");
//     } catch (err) {
//       alert(err.response?.data?.msg || "Error registering");
//     }
//   };

//   return (
//     <div>
//       <Navbar />   {/* ✅ Navbar added here */}
//       <div className="page-container">
//         <form className="card" onSubmit={handleSubmit}>
//           <h2>Register</h2>
//           <input
//             name="name"
//             type="text"
//             placeholder="Full Name"
//             onChange={handleChange}
//             required
//             className="input-field"
//           />
//           <input
//             name="email"
//             type="email"
//             placeholder="Email"
//             onChange={handleChange}
//             required
//             className="input-field"
//           />
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             onChange={handleChange}
//             required
//             className="input-field"
//           />
//           <input
//             name="location"
//             type="text"
//             placeholder="Location"
//             onChange={handleChange}
//             className="input-field"
//           />
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="input-field"
//           >
//             <option value="user">User</option>
//             <option value="volunteer">Volunteer</option>
//             <option value="admin">Admin</option>
//           </select>
//           {/* <div className="file-input-container">
//             <label htmlFor="profilePhoto" className="file-input-label">
//               Profile Photo
//             </label>
//             <input
//               id="profilePhoto"
//               name="profilePhoto"
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               className="input-field"
//             />
//           </div> */}
//           <button type="submit" className="btn-primary">Register</button>
//           <p className="redirect-text">
//             Already have an account? <Link to="/login">Login</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Register;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";   // ✅ Navbar
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Error registering");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <form className="card" onSubmit={handleSubmit}>
          <h1 className="brand-title">Clean Street</h1>
          <h2>Create Your Account</h2>
          <p className="subtitle">Register to start reporting and tracking street issues</p>

          {error && <p className="error-text">{error}</p>}

          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            onChange={handleChange}
            required
            className="input-field"
          />

          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
            required
            className="input-field"
          />

          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
            className="input-field"
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Enter your location"
            onChange={handleChange}
            className="input-field"
          />

          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
          >
            <option value="user">User</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="redirect-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
