import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { showSuccessAlert, showErrorAlert } from "../Assets/AlertHelper";
import "../styles/Login.css";
import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
import prophecyLogo from "../Assets/images/prophecy-logo.png";
import img from "../Assets/images/img.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Store token
      localStorage.setItem("token", data.token);

      // ✅ Success toast notification
      showSuccessAlert("Login successful!", { position: "top-center", autoClose: 900 });

      console.log("✅ Login successful. Token saved:", data.token);

      setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      console.error("❌ Login Error:", error);

      // ❌ Error toast notification
      showErrorAlert("Invalid username or password", { position: "top-center", autoClose: 900 });
    }

    setLoading(false);
  };

  return (
    <div className="login-page-container">
      <div className="login-container">
        <div className="left-section">
          <img src={img} alt="Logo" className="side-image" />
        </div>
        <div className="right-section">
          <div className="logo-section">
            <img src={prophecyLogo2} alt="Logo" className="logo" />
            <img src={prophecyLogo} alt="Logo" className="logo1" />
          </div>
          <h1>Login</h1>

          <form onSubmit={handleLogin}>
            {/* Username Input */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off" // Prevents Chrome autocomplete
            />

            {/* Password Input */}
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password" // Prevents Chrome autofill popups
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="eye-icon"
                onClick={togglePasswordVisibility}
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Forgot Password */}
            <p className="forgot-password">
              <a href="/forgot">Forgot Password?</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
