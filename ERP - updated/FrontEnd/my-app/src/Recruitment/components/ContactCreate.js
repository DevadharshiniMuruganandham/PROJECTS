import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateContact.css";
import { useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import Swal from "sweetalert2";

const CreateContact = () => {
  const navigate = useNavigate();
  
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    department: "",
    fax: "",
    clientName: "",
    email: "",
    secondaryEmail: "",
    jobTitle: "",
    workPhone: "",
    mobile: "",
    mailingStreet: "",
    mailingCity: "",
    mailingProvince: "",
    mailingPostalCode: "",
    mailingCountry: "",
    otherStreet: "",
    otherCity: "",
    otherProvince: "",
    otherPostalCode: "",
    otherCountry: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    source: "",
    contactOwner: "",
    isPrimaryContact: false,
    emailOptOut: false,
    description: ""
});

  const [Mobile, setMobile] = useState("")

  const [Workphone, setWorkphone] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: checked,
    });
  };


    const fileInputRef = useRef(null); 
  
    const handleBrowseClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click(); // Open file dialog
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      console.log("Submitting Contact Info:", contactInfo); // ✅ Debugging
      
      try {
          const response = await axios.post("http://localhost:5000/api/contacts", contactInfo, {
              headers: {
                  "Content-Type": "application/json"
              }
          });
  
          if (response.status === 201) {
              Swal.fire("Contact created successfully!");
              setContactInfo({
                firstName: "",
                lastName: "",
                department: "",
                fax: "",
                clientName: "",
                email: "",
                secondaryEmail: "",
                jobTitle: "",
                workPhone: "",
                mobile: "",
                mailingStreet: "",
                mailingCity: "",
                mailingProvince: "",
                mailingPostalCode: "",
                mailingCountry: "",
                otherStreet: "",
                otherCity: "",
                otherProvince: "",
                otherPostalCode: "",
                otherCountry: "",
                linkedin: "",
                facebook: "",
                twitter: "",
                source: "",
                contactOwner: "",
                isPrimaryContact: false,
                emailOptOut: false,
                description: ""
            });
        }
       navigate("/Contactlisting")
      } 
      catch (error) {
          console.error("Error creating contact:", error.response?.data || error.message);
          if (error.code === "ERR_NETWORK") {
          Swal.fire(" Cannot connect to the server. Make sure the backend is running.");
        } else {
            Swal.fire(`Error: ${error.response?.data?.message || error.message}`);
        }
      }
  };

  const copyAddress = (option) => {
    if (option === "mailingToOther") {
      setContactInfo({
        ...contactInfo,
        otherStreet: contactInfo.mailingStreet,
        otherCity: contactInfo.mailingCity,
        otherProvince: contactInfo.mailingProvince,
        otherPostalCode: contactInfo.mailingPostalCode,
        otherCountry: contactInfo.mailingCountry,
      });
    } else if (option === "otherToMailing") {
      setContactInfo({
        ...contactInfo,
        mailingStreet: contactInfo.otherStreet,
        mailingCity: contactInfo.otherCity,
        mailingProvince: contactInfo.otherProvince,
        mailingPostalCode: contactInfo.otherPostalCode,
        mailingCountry: contactInfo.otherCountry,
      });
    }
  };

  return (
    <div className="create-contact">
      <div className="header-section">
        <h1>Create Contact</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section">
          <h2>Contact Information</h2>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
               <fieldset className="name-fieldset">
                  <select className="title-select">
                    <option value="">- None -</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                  <input
                  className="name-input"
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={contactInfo.firstName}
                    onChange={handleInputChange}
                    required />
                  </fieldset>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={contactInfo.lastName}
                  onChange={handleInputChange}
                  required/>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={contactInfo.department}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="clientName">Client Name</label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={contactInfo.clientName}
                    onChange={handleInputChange}
                  />
                  
              
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fax">Fax</label>
                <input
                  type="text"
                  id="fax"
                  name="fax"
                  value={contactInfo.fax}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  required/>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="secondaryEmail">Secondary Email</label>
                <input
                  type="email"
                  id="secondaryEmail"
                  name="secondaryEmail"
                  value={contactInfo.secondaryEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={contactInfo.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
             
              <div className="form-group">
                <label htmlFor="workPhone">Work Phone</label>
                <PhoneInput
                country={"us"}
                enableSearch={true}
                placeholder="Enter phone number"
                inputStyle={{ width: "100%" }}
                value={Workphone}
                onChange={(value) => setWorkphone(value)}
                />
              </div>
                       
              <div className="form-group">
                <label htmlFor="mobile">Mobile</label>
                <PhoneInput
                country={"us"}
                enableSearch={true}
                placeholder="Enter phone number"
                inputStyle={{ width: "100%" }}
                value={Mobile}
                onChange={(value) => setMobile(value)} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Address Information</h2>
            <div className="copy-address">
              <button type="button" className="copy-dropdown">
                Copy Address
                
              </button>
              <div className="copy-options">
                <div onClick={() => copyAddress("mailingToOther")}>Copy Mailing to Other</div>
                <div onClick={() => copyAddress("otherToMailing")}>Copy Other to Mailing</div>
              </div>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mailingStreet">Mailing Street</label>
                <input
                  type="text"
                  id="mailingStreet"
                  name="mailingStreet"
                  value={contactInfo.mailingStreet}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherStreet">Other Street</label>
                <input
                  type="text"
                  id="otherStreet"
                  name="otherStreet"
                  value={contactInfo.otherStreet}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mailingCity">Mailing City</label>
                <input
                  type="text"
                  id="mailingCity"
                  name="mailingCity"
                  value={contactInfo.mailingCity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherCity">Other City</label>
                <input
                  type="text"
                  id="otherCity"
                  name="otherCity"
                  value={contactInfo.otherCity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mailingProvince">Mailing Province</label>
                <input
                  type="text"
                  id="mailingProvince"
                  name="mailingProvince"
                  value={contactInfo.mailingProvince}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherProvince">Other Province</label>
                <input
                  type="text"
                  id="otherProvince"
                  name="otherProvince"
                  value={contactInfo.otherProvince}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mailingPostalCode">Mailing Postal Code</label>
                <input
                  type="text"
                  id="mailingPostalCode"
                  name="mailingPostalCode"
                  value={contactInfo.mailingPostalCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherPostalCode">Other Postal Code</label>
                <input
                  type="text"
                  id="otherPostalCode"
                  name="otherPostalCode"
                  value={contactInfo.otherPostalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mailingCountry">Mailing Country</label>
                <input
                  type="text"
                  id="mailingCountry"
                  name="mailingCountry"
                  value={contactInfo.mailingCountry}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherCountry">Other Country</label>
                <input
                  type="text"
                  id="otherCountry"
                  name="otherCountry"
                  value={contactInfo.otherCountry}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Social Links</h2>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={contactInfo.linkedin}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={contactInfo.facebook}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="twitter">Twitter</label>
                <div className="twitter-input">
                  <span className="twitter-at"></span>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={contactInfo.twitter}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Other Info</h2>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <select
                  id="source"
                  name="source"
                  value={contactInfo.source}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Added by User">Added by User</option>
                  <option value="Referral">Referral</option>
                  <option value="Web">Web</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contactOwner">Contact Owner</label>
                <select
                  id="contactOwner"
                  name="contactOwner"
                  value={contactInfo.contactOwner}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Tina">Tina</option>
                  <option value="John">John</option>
                  <option value="Sarah">Sarah</option>
                  <option value="Michael">Michael</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group1 checkbox-group">
                <label htmlFor="isPrimaryContact">Is primary contact</label>
                <input
                  type="checkbox"
                  id="isPrimaryContact"
                  name="isPrimaryContact"
                  checked={contactInfo.isPrimaryContact}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div className="form-group1 checkbox-group">
                <label htmlFor="emailOptOut">Email Opt Out</label>
                <input
                  type="checkbox"
                  id="emailOptOut"
                  name="emailOptOut"
                  checked={contactInfo.emailOptOut}
                  onChange={handleCheckboxChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Description Information</h2>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <ReactQuill
                className="quill-editor"
  value={contactInfo.description}
  onChange={(value) => setContactInfo({ ...contactInfo, description: value })}
/>
              </div>
            </div>
          </div>
        </div>

      <div className="section">
      <h2 className="section-title">Attachment Information</h2>
      <div className="form-grid">
        <div className="form-row">
          <div className="form-group attachment-group">
            <label htmlFor="fileUpload" className="attachment-label">Others</label>
            <div className="attachment-dropdown">
            <button type="button" className="browse-btn" onClick={handleBrowseClick}>
        Browse
      </button>
      <input
        type="file"
        id="fileUpload"
        ref={fileInputRef}
        className="hidden-file-input"
        style={{ display: "none" }} // Hides the input
      />
            </div>
          </div>
        </div>
      </div>
    </div>


       
      </form>
      
      <div className="form-buttons">
          <button type="button" className="cancel" onClick={() => navigate("/client")}>Cancel</button>
          <button 
    type="submit" 
    className="save" 
    onClick={handleSubmit} >
    Save
          </button>
        </div>
    </div>
  );
};

export default CreateContact;