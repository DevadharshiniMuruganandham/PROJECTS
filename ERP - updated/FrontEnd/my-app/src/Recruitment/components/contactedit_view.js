import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/contactedit_view.css";
import Swal from "sweetalert2";

const ContactView = () => {
  const navigate = useNavigate();

  // Load selected columns from localStorage or set default
  const [selectedContacts, setselectedContacts] = useState([]);

  useEffect(() => {
    const storedColumns = JSON.parse(localStorage.getItem("selectedColumns_Contacts")) || [" contactId"];
    setselectedContacts(storedColumns);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const [availableOptions, setAvailableOptions] = useState([
    "contactId",
    "firstName",
    "lastName",
    "email",
    "workPhone",
    "mobile",
    "department",
    "fax",
    "secondaryEmail",
    "jobTitle",
    "source",
    "contactOwner",
    "isPrimaryContact",
    "emailOptOut",
    "description",
    "createdAt",
    "updatedAt"
  ]);

  // Handle selecting a column
  const handleSelect = useCallback((option) => {
    if (!selectedContacts.includes(option)) {
      setselectedContacts((prev) => [...prev, option]);
      setAvailableOptions((prev) => prev.filter((item) => item !== option));
    }
  }, [selectedContacts]);

  // Handle removing a column
  const handleRemove = useCallback((option) => {
    setselectedContacts((prev) => prev.filter((item) => item !== option));
    setAvailableOptions((prev) => [...prev, option]);
  }, []);

  // Filter available columns based on search
  const filteredOptions = availableOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Save selected columns to localStorage
  const handleSave = () => {
    localStorage.setItem("selectedColumns", JSON.stringify(selectedContacts));
    Swal.fire("Columns saved successfully!");
    navigate("/ContactListing");
  };

  return (
    <div className="manage-contact">
      <div className="header">
        <h1>All Contacts</h1>
        <p className="subheading">List of all contacts in your account</p>
      </div>

      {/* Content Section */}
      <div className="content">
        <div className="columns-container">
          {/* Available Columns */}
          <div className="available-column">
            <h3>Available</h3>
            <input
              type="text"
              placeholder="Search..."
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="scroll-container">
              <ul>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <li key={option} onClick={() => handleSelect(option)}>
                      {option.replace(/([A-Z])/g, ' $1').trim()} {/* Formatting for better readability */}
                    </li>
                  ))
                ) : (
                  <li className="no-results">No matching results</li>
                )}
              </ul>
            </div>
          </div>

          {/* Selected Columns */}
          <div className="selected-column">
            <h3>Selected</h3>
            <div className="scroll-container">
              <ul>
                {selectedContacts.map((option) => (
                  <li key={option} onClick={() => handleRemove(option)}>
                    {option.replace(/([A-Z])/g, ' $1').trim()} {/* Formatting for better readability */} 
                    <span className="remove">✖</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button className="cancel-btn" onClick={() => navigate("/ContactListing")}>
          Cancel
        </button>
        <button className="save-btn" onClick={handleSave} disabled={selectedContacts.length === 0}>
          Save
        </button>
      </footer>
    </div>
  );
};

export default ContactView;
