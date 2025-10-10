
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
const LoginIllustration = () => (
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
        <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif">
            <tspan fontSize="45" fontWeight="500" fontFamily="Arial, sans-serif">Clean Street</tspan>
            <tspan x="50%" dy="2.2em" fontSize="36" fontWeight="bold">Welcome Back!</tspan>
            <tspan x="50%" dy="1.8em" fontSize="16" fontWeight="normal">Log in to continue</tspan>
        </text>
    </svg>
);


function Login() {
  
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
                if (res.data.user.role === "admin") {
                    navigate("/admin-dashboard");
                } else if (res.data.user.role === "volunteer") {
                    navigate("/volunteer-dashboard");
                } else {
                    const intendedPath = location.state?.from || "/dashboard";
                    navigate(intendedPath);
                }
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Error logging in");
        } finally {
            setLoading(false);
        }
    };
   

    return (
        <div className="login-page-container">
            <div className="login-container">
                
                <Link to="/" className="login-left-panel">
                    <LoginIllustration />
                </Link>

                <div className="login-right-panel">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Login to Your Account</h2>
                        <p className="subtitle">Enter your credentials to access your dashboard.</p>
                        
                        {error && <p className="error-text">{error}</p>}
                        
                        <div className="input-group">
                            <Mail className="input-icon" size={18} />
                            <input id="email" name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="input-field" autoComplete="email" />
                        </div>
                        
                        <div className="input-group">
                            <Lock className="input-icon" size={18} />
                            <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleChange} required className="input-field" autoComplete="current-password" />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="forgot-link">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Logging In..." : "Login"}
                        </button>
                        
                        <p className="redirect-text">
                            Don’t have an account? <Link to="/register">Register</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;