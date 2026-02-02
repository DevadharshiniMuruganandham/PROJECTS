import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Trash2 } from "lucide-react";

import { showSuccessAlert, showWarningAlert, showErrorAlert } from "../Assets/AlertHelper";
import "../styles/CandidateForm.css";


const InputField = ({ label, type = "text", name, value, onChange, required }) => (
  <label className="input-label">
    <span className="label-text">
      {label} {required && <span className="required-asterisk">*</span>}
    </span>
    <input type={type} name={name} value={value} onChange={onChange} required={required} />
  </label>
);



const CreateCandidate = () => {
  const [showEducation, setShowEducation] = useState(false);
  const [educationList, setEducationList] = useState([]);
  
  const [showExperience, setShowExperience] = useState(false);
  const [experienceList, setExperienceList] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    website: "",
    secondaryEmail: "",
    firstNamePrefix: "None",
    firstName: "",
    lastName: "",
    mobile: "",
    fax: "",
    street: "",
    city: "",
    country: "",
    postalCode: "",
    province: "",
    experience: "",
    currentJobTitle: "None",
    expectedSalary: "",
    skillSet: "",
    skypeID: "",
    highestQualification: "None",
    currentEmployer: "",
    currentSalary: "",
    additionalInfo: "",
    linkedIn: "",
    twitter: "",
    facebook: "",
    
  });
  const [attachments, setAttachments] = useState({
    resume: "",
    formattedResume: "",
    coverLetter: "",
    others: "",
    offer: "",
    contracts: "",
  });
  

  const handlePhoneChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to Array
    setAttachments((prev) => ({
      ...prev,
      [field]: selectedFiles, // Store files properly
    }));
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const addEducation = () => {
    setShowEducation(true);
    setEducationList((prevList) => [...(prevList || []), { institute: "", major: "", degree: "", startDate: "", endDate: "" }]);
  };
  const handleChangeEdu = (index, field, value) => {
    const newList = [...educationList];
    newList[index][field] = value;
    setEducationList(newList);
  };

  const removeEducation = (index) => {
    const newList = educationList.filter((_, i) => i !== index);
    setEducationList(newList);
    if (newList.length === 0) setShowEducation(false);
  };

  const addExperience = () => {
    setShowExperience(true);
    setExperienceList((prevList) => [...(prevList || []), { role: "", company: "", year: "" }]);
  };

  const handleChangeExp = (index, field, value) => {
    const newList = [...experienceList];
    newList[index][field] = value;
    setExperienceList(newList);
  };

  const removeExperience = (index) => {
    const newList = experienceList.filter((_, i) => i !== index);
    setExperienceList(newList);
    if (newList.length === 0) setShowExperience(false);
  };
  const formattedEducation = educationList.map((edu) => ({
    institute: edu.institute, // Ensure consistency with state
    major: edu.major,
    degree: edu.degree,
    startDate: edu.startDate,
    endDate: edu.endDate,
  }));
  
  const formattedExperience = experienceList.map((exp) => ({
    role: exp.role, 
    company: exp.company, 
    year: exp.year, 
  }));
  const showToast = (message, type = "success") => {
    if (type === "success") {
      showSuccessAlert(message, { position: "top-center", autoClose: 3000 });
    } else if (type === "error") {
      showErrorAlert(message, { position: "top-center", autoClose: 3000 });
    } else {
      showWarningAlert(message, { position: "top-center", autoClose: 3000 });
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const candidateData = new FormData();
    
    // 🔹 Validate required fields
    const requiredFields = [
      { field: formData.email, name: "Email" },
      { field: formData.firstName, name: "First Name" },
      { field: formData.lastName, name: "Last Name" },
      { field: formData.expectedSalary, name: "Expected Salary" }
    ];
    
    for (let { field, name } of requiredFields) {
      if (!field) {
        showToast(`❌ ${name} is required.`,"error");
        return;
      }
    }
    
    // 🔹 Append candidate details
    Object.keys(formData).forEach((key) => {
      candidateData.append(key, formData[key]);
    });
  
    // 🔹 Append education & experience as JSON
    candidateData.append("education", JSON.stringify(formattedEducation));
    candidateData.append("workexperience", JSON.stringify(formattedExperience));
  
    console.log("Submitting Candidate Data:");
    for (let pair of candidateData.entries()) {
      console.log(pair[0], pair[1]);
    }
  
    try {
      // 🔹 Step 1: Create Candidate (WITHOUT FILES)
      const response = await fetch("http://localhost:5000/api/candidates/create", {
        method: "POST",
        body: candidateData, // ✅ No files in this step
      });
  
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save candidate.");
      }
  
      showErrorAlert("Candidate saved successfully!");
  
      // 🔹 Step 2: Upload Files (ONLY if candidate creation is successful)
      if (attachments && Object.keys(attachments).length > 0) {
        const fileData = new FormData();
        fileData.append("candidateId", responseData.candidateId);
  
        Object.keys(attachments).forEach((key) => {
          const files = attachments[key];
          if (files) {
            for (let i = 0; i < files.length; i++) {
              fileData.append("files", files[i]);
            }
          }
        });
  
        console.log("Uploading Files for Candidate ID:", responseData.candidateId);
        for (let pair of fileData.entries()) {
          console.log(pair[0], pair[1]);
        }
  
        const fileUploadResponse = await fetch("http://localhost:5000/api/candidates/uploadFiles", {
          method: "POST",
          body: fileData,
        });
  
        const fileUploadData = await fileUploadResponse.json();
        if (!fileUploadResponse.ok) {
          throw new Error(fileUploadData.message || "File upload failed.");
        }
  
        showSuccessAlert("Files uploaded successfully!");
      }
    } catch (error) {
      showErrorAlert("Failed to save candidate. " + error.message);
    }
  };
  

     
  

  return (
    <div className="candidate-form">
      <div className="top">
        <h2 >Create Candidate</h2>
      <div className="buttons">
      <button type="button" className="cancel" onClick={(e) => handleSubmit(e)}>
  Cancel
</button>
      <button type="button" className="primary-save" onClick={(e) => handleSubmit(e)}>
  Save
</button>
<button type="button" className="primary-save" onClick={(e) => handleSubmit(e)}>
  Save & associate
</button>

      </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Basic Info</h3>
          <div className="grid-container">
            <InputField label="Primary Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <label className="input-label">
                <span className="label-text">
                         First Name <span className="required-asterisk">*</span>
                </span>
                 <div className="first-name-container">
                <select name="firstNamePrefix" value={formData.firstNamePrefix} onChange={handleChange}>
                <option>None</option>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Dr.</option>
                </select>
               <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
               </div>
              </label>

            <label>
              Primary Mobile
              <PhoneInput country={"in"} value={formData.phone} onChange={(value) => handlePhoneChange(value, "phone")} />
            </label>
            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <InputField label="Website" type="url" name="website" value={formData.website} onChange={handleChange} />
            <label>
              Secondary Mobile
              <PhoneInput country={"in"} value={formData.mobile} onChange={(value) => handlePhoneChange(value, "mobile")} />
            </label>
            <InputField label="Secondary Email" type="email" name="secondaryEmail" value={formData.secondaryEmail} onChange={handleChange} />
            <InputField label="Fax" name="fax" value={formData.fax} onChange={handleChange} />
          </div>
        </div>

        <div className="section">
          <h3>Address Information</h3>
          <div className="grid-container">
            <InputField label="Street" name="street" value={formData.street} onChange={handleChange} />
            <InputField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} />
            <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
            <InputField label="Province" name="province" value={formData.province} onChange={handleChange} />
            <InputField label="Country" name="country" value={formData.country} onChange={handleChange} />
          </div>
        </div>

        <div className="section">
          <h3>Professional Details</h3>
          <div className="grid-container">
            <InputField label="Experience in Years" name="experience" value={formData.experience} onChange={handleChange} />
            <label>
              Current Job Title
              <select name="currentJobTitle" value={formData.currentJobTitle} onChange={handleChange}>
                <option>None</option>
                <option>Software Engineer</option>
                <option>Project Manager</option>
                <option>Data Analyst</option>
              </select>
            </label>
            <InputField label="Expected Salary" name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} required/>
            <InputField label="Skill Set" name="skillSet" value={formData.skillSet} onChange={handleChange} />
            <InputField label="Skype ID" name="skypeID" value={formData.skypeID} onChange={handleChange} />
            <label>
              Highest Qualification
              <select name="highestQualification" value={formData.highestQualification} onChange={handleChange}>
                <option>None</option>
                <option>Bachelor's</option>
                <option>Master's</option>
                <option>PhD</option>
              </select>
            </label>
          </div>
        </div>

        <div className="section">
          <h3>Social Links</h3>
          <div className="grid-container">
            <InputField label="LinkedIn" type="url" name="linkedIn" value={formData.linkedIn} onChange={handleChange} />
            <InputField label="Twitter" name="twitter" value={formData.twitter} onChange={handleChange} />
            <InputField label="Facebook" type="url" name="facebook" value={formData.facebook} onChange={handleChange} />
          </div>
        </div>
        {/* Education and Experience */}
        <div className="container-edu">
        <h3>Educational Details</h3>
<button type="button" onClick={addEducation} className="add-btn">
  + Add Educational Details
</button>
{showEducation && (
  educationList.map((edu, index) => (
    <div key={index} className="input-container">
      <input type="text" placeholder="school/Institute" value={edu.institute} onChange={(e) => handleChangeEdu(index, "institute", e.target.value)} />
      <input type="text" placeholder="Major / Department" value={edu.major} onChange={(e) => handleChangeEdu(index, "major", e.target.value)} />
      <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => handleChangeEdu(index, "degree", e.target.value)} />
      <input type="date"  placeholder="MM/YYYY" value={edu.startDate} onChange={(e) => handleChangeEdu(index, "startDate", e.target.value)} />
      <input type="date"  placeholder="MM/YYYY" value={edu.endDate} onChange={(e) => handleChangeEdu(index, "endDate", e.target.value)} />
      <button onClick={() => removeEducation(index)} className="remove-btn">
        <Trash2 size={18} /> 
      </button>
    </div>
  ))
)}
</div>
<div className="container-edu">
      <h3>Experience Details</h3>
      <button type="button" onClick={addExperience} className="add-btn">+ Add Experience Details</button>
      {showExperience && (
        experienceList.map((exp, index) => (
          <div key={index} className="input-container">
            <input type="text" placeholder="Role" value={exp.role} onChange={(e) => handleChangeExp(index, "role", e.target.value)} />
            <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleChangeExp(index, "company", e.target.value)} />
            <input type="number" placeholder="Year" value={exp.year} onChange={(e) => handleChangeExp(index, "year", e.target.value)} />
            <button onClick={() => removeExperience(index)} className="remove-btn" > <Trash2 size={18} /></button>
          </div>
        ))
      )}
    </div>
       {/* Attachment Information */}
       <h3 className="attachment-title">Attachment Information</h3>
       <div className="grid-container">
 
  {["Resume", "Formatted Resume", "Cover Letter", "Others", "Offer", "Contracts"].map(
    (field, index) => (
      <div key={index} className="attachment-item">
        <label className="attachment-label">{field}</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, field.toLowerCase().replace(/\s/g, ""))}
          className="attachment-input"
        />
      </div>
    )
  )}
</div>

      </form>
    </div>
  );
};

export default CreateCandidate;
