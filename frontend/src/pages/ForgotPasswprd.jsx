import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "OTP sent to your email.");
        setMessageType("success");
        setStep(2);
      } else {
        setMessage(data.msg || "Error sending OTP.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "OTP verified. You can now reset your password.");
        setMessageType("success");
        setStep(3);
      } else {
        setMessage(data.msg || "Invalid or expired OTP.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "Password reset successful.");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.msg || "Error resetting password.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="forgot-container">
        {step === 1 && (
          <form className="forgot-form" onSubmit={handleSendOtp}>
            <h1 className="brand-title">Clean Street</h1>
            <h2>Forgot Password</h2>
            <p className="subtitle">Enter your registered email</p>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
            {message && <p className={`message ${messageType}`}>{message}</p>}
            <p className="redirect-text">
              Back to <Link to="/login">Login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-form" onSubmit={handleVerifyOtp}>
            <h1 className="brand-title">Clean Street</h1>
            <h2>Enter OTP</h2>
            <p className="subtitle">Check your email for the OTP</p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            {message && <p className={`message ${messageType}`}>{message}</p>}
          </form>
        )}

        {step === 3 && (
          <form className="forgot-form" onSubmit={handleResetPassword}>
            <h1 className="brand-title">Clean Street</h1>
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your new password</p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            {message && <p className={`message ${messageType}`}>{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
