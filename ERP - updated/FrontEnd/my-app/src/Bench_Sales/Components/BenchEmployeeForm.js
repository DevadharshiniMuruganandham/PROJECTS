import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../Styles/BenchEmployeeForm.css";
import { showSuccessAlert, showErrorAlert } from "../../Recruitment/Assets/AlertHelper";

const BenchEmployeeForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode"); // Get mode from URL

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    company: "",
    experience: "",
    skills: "",
    preferredLocation: "",
    availability: "",
    linkedIn: "",
    resumeFile: null,
  });

  const [resumePreview, setResumePreview] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes efficiently
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found.");
  
      const response = await axios.post("http://localhost:5000/api/auth/refresh-token", { refreshToken });
      localStorage.setItem("token", response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("token"); // Clear invalid token
      localStorage.removeItem("refreshToken");
      throw error;
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formDataToSend = new FormData();
    formDataToSend.append("resume", file);

    let response;

    try {
        let token = localStorage.getItem("token");
        if (!token) token = await refreshToken(); // Refresh token if missing

        response = await axios.post("http://localhost:5000/api/bench-employee/upload", formDataToSend, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("✅ Resume Upload Response:", response.data);

    } catch (error) {
        if (error.response?.status === 403) {
            console.warn("🔄 Token expired, refreshing...");
            try {
                const newToken = await refreshToken();
                response = await axios.post("http://localhost:5000/api/bench-employee/upload", formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${newToken}`,
                    },
                });

                console.log("✅ Resume uploaded successfully after token refresh:", response.data);
            } catch (refreshError) {
                console.error("❌ Error after refreshing token:", refreshError);
                setError("Session expired. Please log in again.");
            }
        } else {
            console.error("❌ Resume upload error:", error.response?.data || error.message);
            setError("Error processing resume. Please try again.");
        }
    } finally {
        setUploading(false);
    }

    if (response?.data) {
        console.log("🔄 Updating form with:", response.data);
        setFormData((prev) => ({
            ...prev,
            name: response.data.name !== "Unknown" ? response.data.name : "",
            email: response.data.email !== "Not found" ? response.data.email : "",
            phone: response.data.phone !== "Not found" ? response.data.phone : "",
            skills: response.data.skills || "",
            experience: response.data.experience || "",
            linkedin: response.data.linkedin !== "Not found" ? response.data.linkedin : "",
        }));
    }
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Required field validation
    const requiredFields = ["name", "email", "phone", "jobTitle", "skills"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError("Please fill all required fields.");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const response = await axios.post("http://localhost:5000/api/bench-employee/save", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        showSuccessAlert("Application submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          jobTitle: "",
          company: "",
          experience: "",
          skills: "",
          preferredLocation: "",
          availability: "",
          linkedIn: "",
          resumeFile: null,
        });
        setResumePreview(null);
      }
    } catch (error) {
      console.error("Application submission error:", error);
      setError(error.response?.data?.error || "Error submitting application. Please try again.");
    }
  };

  return (
    <div className="bench-form-container">
      <h2>Bench Employee Project Application</h2>
      {error && <p className="error-msg">{error}</p>}
      {successMessage && <p className="success-msg">{successMessage}</p>}

      <form className="bench-form" onSubmit={handleSubmit}>
        {/* Resume Upload */}
        {mode === "upload" && (
          <>
            <label>Upload Resume (PDF/DOCX) *</label>
            <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <p>Uploading and processing file...</p>}
            {resumePreview && <iframe src={resumePreview} className="resume-preview"></iframe>}
          </>
        )}

        {/* Form Fields */}
        <label>Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Phone *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

        <label>Job Title *</label>
        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />

        <label>Company (Current/Previous)</label>
        <input type="text" name="company" value={formData.company} onChange={handleChange} />

        <label>Experience (Years)</label>
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" />

        <label>Skills *</label>
        <textarea name="skills" value={formData.skills} onChange={handleChange} required></textarea>

        <label>Preferred Location</label>
        <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} />

        <label>Availability *</label>
        <select name="availability" value={formData.availability} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="Immediate">Immediate</option>
          <option value="1 Week">1 Week</option>
          <option value="2 Weeks">2 Weeks</option>
          <option value="1 Month">1 Month</option>
        </select>

        <label>LinkedIn Profile</label>
        <input type="url" name="linkedIn" value={formData.linkedin} onChange={handleChange} />

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default BenchEmployeeForm;
