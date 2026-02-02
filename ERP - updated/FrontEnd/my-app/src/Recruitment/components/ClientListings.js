import React, { useEffect, useState, useRef } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/ClientListings.css";
import { MdDelete } from "react-icons/md";
import { FaFileImport, FaEllipsisV, FaTable, FaSortAlphaDown, FaFilter,FaSearch } from "react-icons/fa";
import Pagination from "../utils/Pagination";
import { generatePageNumbers, RowsPerPageSelector } from "../utils/paginationUtils";
import { availableColumns } from "../config/ClientConfig";
import {
  deleteSingleRow,
  deleteSelectedRows,
  handleSingleDelete,
  handleMultipleDelete,
} from "../utils/jobDeletion";
import ClientFilter from "./ClientFilter";

const ClientListings = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClientsColumns, setselectedClientsColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempselectedClientsColumns, setTempselectedClientsColumns] = useState(selectedClientsColumns);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
const [selectedView, setSelectedView] = useState(""); // Default empty view
const [views, setViews] = useState([]); // Array of available views
const navigate = useNavigate();
const handleViewSelection = (viewName) => {
  setSelectedView(viewName);
  setDropdownOpen(false); // Close dropdown after selection
};

  // Function to handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredClients(clients.filter((client) => client.clientName.toLowerCase().includes(value)));
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log("Selected file:", event.target.files[0]);
  };

  // Open file explorer
  const handleImportClick = () => {
    document.getElementById("fileInput").click();
  };


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
        const data = await response.json();
        console.log("Fetched Clients Data:", data); // 🔍 Check this log
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);
  useEffect(() => {
    const storedColumns = JSON.parse(localStorage.getItem("selectedClientsColumns"));
    if (storedColumns) {
      setselectedClientsColumns(storedColumns);
    }
  }, []);
  

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const indexOfLastClient = currentPage * rowsPerPage;
  const indexOfFirstClient = indexOfLastClient - rowsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  const toggleRowSelection = (clientId) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(clientId) ? newSelection.delete(clientId) : newSelection.add(clientId);
      return newSelection;
    });
  };

  const sortClients = (key) => {
    if (!key) return;
    setFilteredClients((prevClients) => {
      return [...prevClients].sort((a, b) => {
        let valueA = a[key] ?? "";
        let valueB = b[key] ?? "";

        if (!isNaN(valueA) && !isNaN(valueB)) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        }

        return sortConfig.direction === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      });
    });

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleBulkDelete = async () => {
    await deleteSelectedRows(
      Array.from(selectedRows),
      handleMultipleDelete,
      clients,
      setClients,
      setFilteredClients,
      setSelectedRows
    );
  };

  return (
    <div className={`client-page-container ${showFilters ? "sidebar-open" : ""}`}>
      
      {/* Overlay - Closes Sidebar on Click */}
      {showFilters && <div className="overlay" onClick={() => setShowFilters(false)}></div>}
  
      {showFilters && (
        <div className="filter-sidebar active">
          <ClientFilter clients={clients} setFilteredClients={setFilteredClients} />
        </div>
      )}
      {/* Main Content */}
      <div className="client-content">
        <h2>All Clients</h2>
        
        {/* Search & Filter Button */}
        <div className="search-filter-container">
          <button className="filter-button" onClick={() => setShowFilters((prev) => !prev)}>
            <FaFilter size={20} /> Filters
          </button>  
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Client Name..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
  
        {/* Toolbar */}
        <div className="toolbar">
          <div className="action-buttons">
            <button className="delete-selected-btn" onClick={handleBulkDelete} disabled={selectedRows.size === 0}>
              <MdDelete size={20} /> 
            </button>
  
            {/* Dropdown for Views */}
            <div className="dropdown">
              <button className="select-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {selectedView || "Select View"}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  {views.length > 0 ? (
                    views.map((view) => (
                      <p key={view.name} className={selectedView === view.name ? "active-filter" : ""} onClick={() => handleViewSelection(view.name)}>
                        {view.name}
                      </p>
                    ))
                  ) : (
                    <p className="no-views">No Views Available</p>
                  )}
                  
                  <Link to="/client_view" className="create-view">+ Create View</Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Edit button positioned to the right */}
          <Link to="/client-column" className="edit-link">Edit</Link>
          <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} />
          <button className="import-button" onClick={handleImportClick}>
            <FaFileImport size={18} /> Import File
          </button>
          <button className="navigate-button" onClick={() => navigate("/client-creation")}>
            Create Client
          </button>
  
  
          <RowsPerPageSelector rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </div>
  
        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={(e) => setSelectedRows(e.target.checked ? new Set(clients.map((client) => client.clientId)) : new Set())} />
              </th>
              <th onClick={() => sortClients("clientId")}>Client ID</th>
              <th onClick={() => sortClients("clientName")}>Client Name</th>
              {selectedClientsColumns.map((col) => (
                <th key={col} onClick={() => sortClients(col)}>
                  {availableColumns.find((c) => c.key === col)?.label || col}
                </th>
              ))}
              {selectedRows.size > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentClients.length > 0 ? (
              currentClients.map((client) => (
                <tr key={client.clientId}>
                  <td>
                    <input type="checkbox" checked={selectedRows.has(client.clientId)} onChange={() => toggleRowSelection(client.clientId)} />
                  </td>
                  <td>{client.clientId}</td>
                  <td>
                    <Link to={`/client-details/${client.clientId}`}>{client.clientName}</Link>
                  </td>
                  {selectedClientsColumns.map((col) => (
                    <td key={`${col}-${client.clientId}`}>{client[col] || "N/A"}</td>
                  ))}
                  {selectedRows.has(client.clientId) && (
                    <td>
                      <button className="delete-icon-btn" onClick={() => deleteSingleRow(client.clientId, handleSingleDelete, clients, setClients, setFilteredClients, setSelectedRows)}>
                        <MdDelete size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">No clients available.</td></tr>
            )}
          </tbody>
        </table>
  
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
  
};

export default ClientListings;
