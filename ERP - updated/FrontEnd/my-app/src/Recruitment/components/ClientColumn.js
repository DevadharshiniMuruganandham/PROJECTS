import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClientColumn.css";
import { showSuccessAlert, showWarningAlert, showErrorAlert } from "../Assets/AlertHelper";
const ManageClientView = () => {
  const [selectedClients , setselectedClients ] = useState(() => {
    return JSON.parse(localStorage.getItem("selectedClientsColumns")) || [
      "clientName",
  
    ];
  });

  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const [availableOptions, setAvailableOptions] = useState([
    "clientId", 
    "clientName", 
    "industry",
    "parentClientId", 
    "website", 
    "createdAt", 
    "contactNumber", 
    "accountManager", 
    "fax",
    "billingStreet", 
    "billingCity", 
    "billingProvince", 
    "billingPostalCode", 
    "billingCountry",
    "shippingStreet", 
    "shippingCity", 
    "shippingProvince", 
    "shippingPostalCode", 
    "shippingCountry",
  ]);

  const handleSelect = (option) => {
    if (!selectedClients .includes(option)) {
      setselectedClients ([...selectedClients , option]);
      setAvailableOptions(availableOptions.filter((item) => item !== option));
    }
  };

  const handleRemove = (option) => {
    setselectedClients (selectedClients .filter((item) => item !== option));
  
    if (!availableOptions.includes(option)) {
      setAvailableOptions([...availableOptions, option]);
    }
  };

  // Filter available options based on search input
  const filteredOptions = availableOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigate = useNavigate(); // Initialize navigation
  const handleCancel=()=>{
    navigate("/Client-listings");
  };

  const handleSave = () => {
    const uniqueColumns = [...new Set(selectedClients )];
    localStorage.setItem ("selectedClientsColumns", JSON.stringify(uniqueColumns));
    setselectedClients (uniqueColumns); // Update state to reflect saved selection
    showSuccessAlert("Columns saved successfully!");
    navigate("/Client-listings"); // Navigate to the Clients page
  };

  return (
    <div className="manage-client">
      <div className="header">
        <h1>All Clients</h1>
        <p className="subheading">List of all Clients in your account</p>
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
                      {option}
                    </li>
                  ))
                ) : (
                  <li className="no-results">No matching results</li>
                )}
              </ul>
            </div>
          </div>

          <div className="selected-column">
            <h3>Selected</h3>
            <div className="scroll-container">
              <ul>
                {selectedClients .map((option) => (
                  <li key={option} onClick={() => handleRemove(option)}>
                    {option} <span className="remove">✖</span>
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
  <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
  <button className="save-btn" onClick={handleSave}>Save</button>
</footer>
    </div>
  );
};

export default ManageClientView;
//edit_view
