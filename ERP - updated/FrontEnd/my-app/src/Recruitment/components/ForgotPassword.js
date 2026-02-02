import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request Reset, Step 2: Change Password
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async () => {
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        setMessage(data.error || "Error sending reset request.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  const handleResetPassword = async () => {
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Password updated! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.error || "Error resetting password.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>{step === 1 ? "Forgot Password?" : "Reset Password"}</h2>
      {message && <p className="message">{message}</p>}
      {step === 1 ? (
        <>
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button onClick={handleRequestReset}>Send Reset Link</button>
        </>
      ) : (
        <>
          <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <button onClick={handleResetPassword}>Reset Password</button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
