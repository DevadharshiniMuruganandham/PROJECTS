
import React, { useRef, useState } from "react";
import "../styles/ClientCreation.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import { showSuccessAlert, showWarningAlert, showErrorAlert } from "../Assets/AlertHelper";

const CreateClient = () => {
  const navigate = useNavigate();

  // State for Billing & Shipping Addresses
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    province: "",
    code: "",
    country: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    province: "",
    code: "",
    country: "",
  });

  // State for Phone Input
  const [contactNumber, setContactNumber] = useState("");

  // Refs for non-address fields
  const clientNameRef = useRef(null);
  const accountManagerRef = useRef(null);
  const industryRef = useRef(null);
  const parentClientRef = useRef(null);
  const faxRef = useRef(null);
  const websiteRef = useRef(null);

  // Handle input changes for Address fields
  const handleBillingChange = (e) => {
    setBillingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleShippingChange = (e) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Copy Address Function
  const copyAddress = (direction) => {
    if (direction === "toShipping") {
      setShippingAddress((prev) => ({ ...billingAddress }));
    } else if (direction === "toBilling") {
      setBillingAddress((prev) => ({ ...shippingAddress }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientNameRef.current.value.trim() || !contactNumber.trim()) {
        showErrorAlert("Client Name and Contact Number are required!");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ No token found. User must be logged in.");
        showErrorAlert("Unauthorized! Please log in again.");
        return;
    }

    console.log("🔍 Auth Header:", `Bearer ${token}`);

    const formData = {
        clientName: clientNameRef.current.value.trim(),
        contactNumber: contactNumber.trim(),
        accountManager: accountManagerRef.current.value.trim() || null,
        industry: industryRef.current.value.trim() || null,
        parentClient: parentClientRef.current.value.trim() || null,
        fax: faxRef.current.value.trim() || null,
        website: websiteRef.current.value.trim() || null,
        ...billingAddress,
        ...shippingAddress,
    };

    console.log("📤 Sending Data:", formData);

    try {
        const response = await fetch("http://localhost:5000/api/clients", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Include the token
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        showSuccessAlert("Client created successfully!");
        navigate("/Clients");
    } catch (error) {
        console.error("❌ API Error:", error);
        showErrorAlert("Failed to create client");
    }
};

  

return (
  <div className="client-form-wrapper">
  <div className="create-client-page">
    <div className="client-form-container">
      <h1>Create Client</h1>

      <form onSubmit={handleSubmit} className="client-form">
        {/* Client Details */}
        <section className="client-details">
          <h3>Client Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Client Name <span className="required">*</span></label>
              <input type="text" ref={clientNameRef} required />

              <label>Contact Number</label>
              <PhoneInput
                country="us"
                enableSearch
                placeholder="Enter phone number"
                inputStyle={{ width: "100%", height: "40px" }}
                value={contactNumber}
                onChange={setContactNumber}
              />

              <label>Account Manager</label>
              <select ref={accountManagerRef}>
                <option value="">Select</option>
                <option value="Tina">Tina</option>
                <option value="John">John</option>
                <option value="Emma">Emma</option>
              </select>

              <label>Industry</label>
              <input type="text" ref={industryRef} />
            </div>

            <div className="form-group">
              <label>Parent Client</label>
              <input type="text" ref={parentClientRef} />

              <label>Fax</label>
              <input type="text" ref={faxRef} />

              <label>Website</label>
              <input type="text" ref={websiteRef} />
            </div>
          </div>
        </section>

        {/* Address Section */}
        <section className="address-details">
          <h3>Address Information</h3>
          <div className="form-grid">
            {/* Billing Address */}
            <div className="form-group">
              <h4>Billing Address</h4>
              {["Street", "City", "Province", "Code", "Country"].map((field) => (
                <div key={field}>
                  <label>{field}</label>
                  <input type="text" name={field.toLowerCase()} value={billingAddress[field.toLowerCase()]} onChange={handleBillingChange} />
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="form-group">
              <h4>Shipping Address</h4>
              {["Street", "City", "Province", "Code", "Country"].map((field) => (
                <div key={field}>
                  <label>{field}</label>
                  <input type="text" name={field.toLowerCase()} value={shippingAddress[field.toLowerCase()]} onChange={handleShippingChange} />
                </div>
              ))}
            </div>
          </div>

          {/* Copy Address Dropdown & Form Buttons */}
          <div className="form-actions">
            <select onChange={(e) => copyAddress(e.target.value === "billingToShipping" ? "toShipping" : "toBilling")} className="copy-address-dropdown">
              <option value="Copy Address">Copy Address</option>
              <option value="billingToShipping">Copy Billing to Shipping</option>
              <option value="shippingToBilling">Copy Shipping to Billing</option>
            </select>

            <div className="button-group">
              <button type="button" className="cancel-btn" onClick={() => navigate("/client-creation")}>Cancel</button>
              <button type="submit" className="save-button" onClick={() => navigate("/Client-listings")}>Save</button>
            
            </div>
          </div>
        </section>
      </form>
    </div>
  </div>
  </div>
);
};
export default CreateClient;

