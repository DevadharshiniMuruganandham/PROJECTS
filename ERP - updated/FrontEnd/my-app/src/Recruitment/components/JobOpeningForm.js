import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/JobOpeningForm.css";
import { showSuccessAlert, showWarningAlert, showErrorAlert } from "../Assets/AlertHelper";
import ClientModal from "../modals/ClientModalNew"; 
import PopupForm1 from "../modals/ContactModalNew"; 
import { RiContactsBook3Line } from "react-icons/ri";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { Link } from "react-router-dom";
const modules = {
  toolbar: [
  // Use the whitelisted fonts
    [{ size: ["small", false, "large", "huge"] }], // Font sizes
    ["bold", "italic", "underline", "strike"], // Text formatting
    [{ color: [] }, { background: [] }], // Font color & Background color
    [{ script: "sub" }, { script: "super" }], // Subscript / Superscript
    [{ header: "1" }, { header: "2" }, { header: "3" }], // Headers
    [{ list: "ordered" }, { list: "bullet" }], // Ordered/Unordered List
    [{ indent: "-1" }, { indent: "+1" }], // Indent
    [{ align: [] }], // Alignment
    ["blockquote", "code-block"], // Blockquote & Code Block
    ["link", "image", "video"], // Link, Image & Video
    ["clean"], // Remove formatting
  ],
};

const JobOpeningForm = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const defaultFormState = {
    postingTitle: "",
    clientName: "",
    contactName: "",
    accountManagerId: "",
    recruiterId: "",
    dateOpened: "",
    targetDate: "",
    jobTypeId: "",
    jobStatusId: "",
    industry: "",
    salary: "",
    workExperience: "",
    city: "",
    countryId: "",
    province: "",
    postalCode: "",
    numPositions: "1",
    revenuePerPosition: "",
    expectedRevenue: "",
    actualRevenue: "",
  };
   // const [isPopupOpen, setIsPopupOpen] = useState(false); 
   
   const [isClientPopupOpen, setIsClientPopupOpen] = useState(false);
   const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
   const [selectedClient, setSelectedClient] = useState("");
  const [formData, setFormData] = useState(defaultFormState);
  const [jobDescription, setJobDescription] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("Choose a Job Template");
  const [searchQuery, setSearchQuery] = useState("");
  const jobTemplates = ["Accountant", "Registered Nurse", "Nanny", "Software Engineer", "Marketing Manager", "Sales Executive"];
  const filteredTemplates = jobTemplates.filter(template =>
    template.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleDescriptionChange = (content) => {
    setJobDescription(content);
  };
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setIsTemplateDropdownOpen(false);
  };

  const handleClientSelect = (clientName) => {
    setSelectedClient(clientName);
    setFormData((prev) => ({ ...prev, clientName }));
  };
  
  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
// Handle Dropdown Outside Click
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// Show Toast Notification
const showToast = (message, type = "success") => {
  if (type === "success") {
    showSuccessAlert(message, { position: "top-center", autoClose: 3000 });
  } else if (type === "error") {
    showErrorAlert(message, { position: "top-center", autoClose: 3000 });
  } else {
    showWarningAlert(message, { position: "top-center", autoClose: 3000 });
  }
};

// Handle Form Submission


const handleSubmit = async (action) => {
  if (!formData.postingTitle.trim()) {
    showToast("❌ Posting Title is required.", "error");
    return;
  }
  if (!formData.clientName.trim()) {
    showToast("❌ Client Name is required.", "error");
    return;
  }
  if (!formData.contactName.trim()) {
    showToast("❌ Contact Name is required.", "error");
    return;
  }
  if (!jobDescription.trim()) {
    showToast("❌ Job Description cannot be empty.", "error");
    return;
  }
  if (!formData.targetDate.trim()) {
    showToast("❌ Target Date cannot be empty.", "error");
    return;
  }
  if (!formData.dateOpened.trim()) {
    showToast("❌ Date Opened cannot be empty.", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("⚠️ Session expired. Please log in again.", "warn");
      navigate("/login");
      return;
    }

    const payload = {
      ...formData,
      clientName: selectedClient,
      jobDescription,
      dateOpened: formData.dateOpened ? new Date(formData.dateOpened).toISOString().split("T")[0] : null,
      targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString().split("T")[0] : null,
    };

    console.log("📤 Sending Form Data:", payload);

    const response = await axios.post("http://localhost:5000/api/jobs/job-openings", payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    showToast(`✔️ Job Opening ${action} successfully!`, "success");
    navigate("/job-listings");
    setFormData(defaultFormState);
    setSelectedClient("");
    setJobDescription("");
  } catch (error) {
    console.error("❌ Error:", error);
    const errorMessage = error.response?.data?.error || "⚠️ Invalid session. Please log in again.";
    showToast(errorMessage, "warn");
    localStorage.removeItem("token");
    navigate("/login");
  }
};

const openClientPopup = () => setIsClientPopupOpen(true);
const closeClientPopup = () => setIsClientPopupOpen(false);

  const openContactPopup = () => setIsContactPopupOpen(true);
  const closeContactPopup = () => setIsContactPopupOpen(false);
  
  

  return (
    <div className="job-opening-page">
    <div className="job-opening-container">
      {/* Header Section */}
      <div className="job-opening-header">
        <h1>Create Job Openings:</h1>

        {/* Job Template Dropdown */}
        <div className="button-container">
         <div className="dropdown" ref={dropdownRef}>
          <button className="template-button" onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}>
            {selectedTemplate} ▼
          </button>
          {isTemplateDropdownOpen && (
    <div className="dropdown-menu">
      {/* Search Bar */}
      <input 
        type="text"
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
                   <button onClick={() => handleTemplateSelect("Choose a Job Template")}>Choose a Job Template</button>
      <hr />
      
      <p style={{ fontWeight: "bold", textAlign: "center" }}>
  Public Job Templates
</p>
      {filteredTemplates.length > 0 ? (
        filteredTemplates.map((template) => (
          <button key={template} onClick={() => handleTemplateSelect(template)}>
            {template}
          </button>
        ))
      ) : (
        <p className="no-results">No templates found</p>
      )}
      

            
      <Link to="/template" className="manage-template">
  + Manage Job Templates
  </Link>

            </div>
          )}
           </div>
  <button className="cancel-button" onClick={() => navigate("/job-listings")}>Cancel</button>

  <div className="dropdwn" ref={dropdownRef}>
    <button className="save-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
      Save and Publish ▼
    </button>
    {isDropdownOpen && (
      <div className="dropdown-menu">
        {["Job Board", "Career Site", "Freelancer"].map((platform) => (
          <button key={platform} onClick={() => handleSubmit(platform)}>
            Post on {platform}
          </button>
        ))}
      </div>
    )}
  </div>

  <button className="save-button" onClick={() => handleSubmit("Saved")}>Save</button>
</div>
        
         </div>
        
            



      {/* Job Opening Form */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-section">
          <h3>Job Opening Information</h3>
          <div className="form-grid">
          {isClientPopupOpen && (
        <ClientModal
          onClose={() => setIsClientPopupOpen(false)}
          onSelectClient={(clientName) => {
            console.log("Client Selected:", clientName);
            setSelectedClient(clientName); 
            setFormData((prev) => ({ ...prev, clientName }));// ✅ Update selected client
            setIsClientPopupOpen(false); // ✅ Close modal after selection
          }}
        />
      )}
            {[
              { label: "Posting Title", name: "postingTitle", required: true },
              {
                label: "Client Name",
                name: "clientName",
                required: true,
                type: "text",
                value: formData.clientName, // ✅ Display selected client name
                onChange: handleChange,
                placeholder: "Select Client",
                readOnly: true, // ✅ Prevent manual editing
                button: {
                  icon: <HiMiniBuildingOffice2 size={18} />,
                  onClick: () => setIsClientPopupOpen(true), // ✅ Open modal on button click
                },
              },
              { label: "Contact Name", name: "contactName", required: true, button: { icon: <RiContactsBook3Line size={18} />, onClick: () => setIsContactPopupOpen(true) } },
              { label: "City", name: "city" },
              { label: "Country", name: "countryId" },
              { label: "Province", name: "province" },
              { label: "Postal Code", name: "postalCode" },
              { label: "Industry", name: "industry" },
              {label:"Actual Revenue ",name:"actualRevenue "},
              {label:"Expected Revenue ",name:"expectedRevenue"},
              {label:"Revenue Per Postition ",name:"    revenuePerPosition: "},
              {label:"Number of Positions ",name:"numPositions: "}
            ].map(({ label, name, required, button }) => (
              <div className="form-group" key={name}>
                <label>
                  {label} {required && <span style={{ color: "red" }}>*</span>}
                </label>
                <div className="input-container">
                  <input type="text" name={name} value={formData[name]} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} />
                  {button && (
                    <button type="button" className="input-icon" onClick={button.onClick}>
                      {button.icon}
                    </button>
                  )}
                </div>
              </div>
            ))}
         
            {/* Dropdowns */}
            {[
              { label: "Account Manager", name: "accountManagerId", options: ["Tina", "Jane Smith"] },
              { label: "Job Type", name: "jobTypeId", options: ["Full-time", "Part-time", "Contract"] },
              { label: "Job Status", name: "jobStatusId", options: ["In-progress", "Closed", "On-hold"] }
            ].map(({ label, name, options }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <select name={name} value={formData[name]} onChange={handleChange}>
                  <option value="">Select</option>
                  {options.map((opt, index) => (
                    <option key={index} value={index + 1}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Dates */}
            {[
              { label: "Date Opened", name: "dateOpened" },
              { label: "Target Date", name: "targetDate" }
            ].map(({ label, name }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input type="date" name={name} value={formData[name]} onChange={handleChange} />
              </div>
            ))}
          </div>
        </div>

        {/* Job Description (Quill Editor) */}
        <div className="form-section1">
      <h3>Description Information</h3>
      <ReactQuill
        value={jobDescription}
        onChange={handleDescriptionChange}
        modules={modules}
        className="quill-editor"
      />
    </div>
      </form>
      {isClientPopupOpen && (
  <ClientModal
    onClose={closeClientPopup}
    onSelectClient={(clientName) => {
      handleClientSelect(clientName);
      closeClientPopup();
    }}
  />
)}


      {isContactPopupOpen && <PopupForm1 onClose={closeContactPopup} onSelectContact={setFormData} />}

    </div>
</div>
  );
};

export default JobOpeningForm;
