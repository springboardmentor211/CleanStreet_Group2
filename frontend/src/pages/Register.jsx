

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Register.css";
import { User, Mail, Lock, MapPin, Briefcase, Eye, EyeOff } from "lucide-react";

const RegisterIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0fdf4" />
                <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
        </defs>
        <rect width="400" height="600" fill="#16a34a" />
        <circle cx="100" cy="150" r="150" fill="url(#g1)" opacity="0.5" />
        <circle cx="350" cy="500" r="200" fill="url(#g1)" opacity="0.6" />
        <path d="M 0 600 Q 100 500 200 550 T 400 500 V 600 Z" fill="url(#g2)" />
        
       
        <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif">
            <tspan fontSize="36" fontWeight="bold">Clean Street</tspan>
            <tspan x="50%" dy="2em" fontSize="16" fontWeight="normal">Join our community to resolve street issues</tspan>
        </text>
    </svg>
);


function Register() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "", location: "", role: "user" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/register", formData, { headers: { "Content-Type": "application/json" } });
            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.msg || "Error registering");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-container">
                <div className="register-left-panel">
                    <RegisterIllustration />
                </div>
                <div className="register-right-panel">
                    <form className="register-form" onSubmit={handleSubmit}>
                        <h2>Create Your Account</h2>
                        <p className="subtitle">Get started by filling out the details below.</p>
                        
                        {error && <p className="error-text">{error}</p>}
                        
                        <div className="input-group">
                            <User className="input-icon" size={18} />
                            <input id="name" name="name" type="text" placeholder="Full Name" onChange={handleChange} required className="input-field" />
                        </div>
                        
                        <div className="input-group">
                            <Mail className="input-icon" size={18} />
                            <input id="email" name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="input-field" />
                        </div>
                        
                        <div className="input-group">
                            <Lock className="input-icon" size={18} />
                            <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleChange} required className="input-field" />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        <div className="input-group">
                            <MapPin className="input-icon" size={18} />
                            <input id="location" name="location" type="text" placeholder="Location (e.g., Visakhapatnam)" onChange={handleChange} className="input-field" />
                        </div>
                        
                        <div className="input-group">
                            <Briefcase className="input-icon" size={18} />
                            <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                                <option value="user">User</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                        
                        <p className="redirect-text">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;