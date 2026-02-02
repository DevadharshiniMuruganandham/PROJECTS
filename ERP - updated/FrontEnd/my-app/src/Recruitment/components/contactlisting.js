import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EllipsisVertical, X, Table, Plus, Phone, ChevronDown } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import "../styles/ContactListing.css";
import { Link } from "react-router-dom";
import JobFilter from "./jobFilter";
import { availableColumns } from "../config/filterConfig";
import Swal from "sweetalert2";

export default function ContactListing() {
  const [contacts, setContacts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moredropdownOpen, setMoredropdownOpen] = useState(false);
  const [filter, setFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [recordsDropdownOpen, setRecordsDropdownOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedView, setSelectedView] = useState("All contacts");
  const [searchQuery, setSearchQuery] = useState("");
  


  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/contacts");
      setContacts(response.data);
      // setFilteredJobs(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setError("Failed to fetch contacts.");
    }finally {
      setLoading(false); // Ensure loading is set to false
    }
  };

  const handleApplyFilters = (filteredData) => {
    setFilteredJobs(filteredData);
  };

  useEffect(() => {
    console.log("Updated Contacts List:", contacts);
  }, [contacts]);
  console.log("First Contact Object:", contacts[0]);

// Filtering contacts based on search input
const filteredContacts = contacts.filter(contact =>
  contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
);
console.log("🔍 Filtered Contacts:", filteredContacts);

const totalPages = Math.ceil(filteredContacts.length / recordsPerPage);

console.log("🔍 Filtered Contacts Count:", filteredContacts.length);

useEffect(() => {
  if (currentPage > totalPages) {
    console.log(`Adjusting currentPage: ${currentPage} -> ${totalPages}`);
    setCurrentPage(totalPages > 0 ? totalPages : 1);
  }
}, [filteredContacts, totalPages]);

const startIndex = (currentPage - 1) * recordsPerPage;
const endIndex = startIndex + recordsPerPage;
const currentContacts = filteredContacts.slice (startIndex, endIndex);
console.log("📌 Current Contacts to Display:", currentContacts);

console.log(`📌 Pagination Start: ${startIndex}, End: ${endIndex}`);
console.log("📌 Current Page:", currentPage, "Total Pages:", totalPages);
console.log("📌 Records Per Page:", recordsPerPage);
console.log("📌 Filtered Contacts Count:", filteredContacts.length);
// useEffect(() => {
//   console.log("Filtered Contacts Length:", filteredContacts.length);
//   console.log("Current Contacts:", currentContacts);
// }, [filteredContacts, currentContacts]);

// Update when records per page changes
useEffect(() => {
  setCurrentPage(1); // Reset to first page when records per page changes
}, [recordsPerPage]);
useEffect(() => {
  if (filteredContacts.length > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [filteredContacts.length, totalPages]);

  // Handling filter changes
  const handleFilterChange = (filterKey) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey] ? null : { condition: "", value: "" },
    }));
  };
  // Handling condition change
  const handleConditionChange = (filterKey, condition) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: { ...prev[filterKey], condition },
    }));
  };
  // Handling filter value change
  const handleValueChange = (filterKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: { ...prev[filterKey], value },
    }));
  };

  const allFields = [
    "contactId", "firstName", "lastName", "email", "workPhone", "mobile", 
     "department", "fax", "clientName", "secondaryEmail", 
    "jobTitle", "source", "contactOwner", "isPrimaryContact", "emailOptOut", 
    "description", "createdAt", "updatedAt"
];

  // Load user preference from localStorage or default to allFields
  const [SelectedContacts, setSelectedContacts] = useState(() => {
    return JSON.parse(localStorage.getItem("selectedContactColumns")) || allFields;
  });
  useEffect(() => {
    const storedColumns = JSON.parse(localStorage.getItem("selectedContactColumns")) || allFields;
    setSelectedContacts([...storedColumns]); // Force update
  }, []);


  // Function to handle column selection
  const toggleColumnSelection = (column) => {
    setSelectedContacts((prevSelected) => {
      let updatedSelection;

      if (prevSelected.includes(column)) {
        // Remove column if already selected
        updatedSelection = prevSelected.filter((col) => col !== column);
      } else {
        // Add column if not selected
        updatedSelection = [...prevSelected, column];
      }

      // Save user preference to localStorage
      localStorage.setItem("selectedContactColumns", JSON.stringify(updatedSelection));
      return updatedSelection;
    });
  };
  // Handle Row Selection
  const handleRowSelection = (contactId) => {
    setSelectedRows((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  // Select All Rows
  const handleSelectAll = () => {
    const contactsToSelect = filteredContacts.length > 0 ? filteredContacts : currentContacts;
    if (selectedRows.length === filteredContacts.length) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(filteredContacts.map(contact => contact.contactId));
    }
  };
    
  // Handle Delete Selected Rows
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
        Swal.fire("No contacts selected.");
        return;
    }

    try {
        // Call API to delete selected contacts
        // await axios.delete("http://localhost:5000/api/contacts", {
        //     headers: { "Content-Type": "application/json" },
        //     data: { contactIds: selectedRows },
        // });
        console.log("Selected Contacts for Deletion:", selectedRows);

        await axios.post("http://localhost:5000/api/contacts/delete-bulk", {
          contactIds: selectedRows, 
      });
      

        // Remove deleted contacts from the list
        setContacts((prevContacts) =>
            prevContacts.filter((contact) => !selectedRows.includes(contact.contactId))
        );

        // Clear selected rows
        setSelectedRows([]);

        // Show success message
        Swal.fire("Contacts deleted successfully!", "", "success");
    } catch (err) {
        // Show error message
        Swal.fire("Failed to delete contacts. Try again!", "", "error");
    }
};

  // ----return statement----
  return (
    // Main container
    <div className="contacts-page" >
      {showFilters && (
        <div className="filter-container">
          <JobFilter jobs={contacts} setFilteredJobs={setFilteredJobs} onApplyFilters={handleApplyFilters} />
        </div>)}
      <div className="content-container">
        <div className="header-container">
          <div className="header-left">
            {/* Filters Button */}
            <button className="filter-btn" onClick={() => {
              setShowFilters((prev) => !prev);
              console.log("Filter button clicked:", !showFilters);
            }
            }>
              <FaFilter size={20} />
            </button>
            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="filters-dropdown">
                {Object.keys(filter).map((filterKey) => (
                  <div key={filterKey} className="filter-option">
                    <label>
                      <input type="checkbox" checked={!!selectedFilters[filterKey]} onChange={() => handleFilterChange(filterKey)} />
                      {filterKey}
                    </label>
                    {selectedFilters[filterKey] && (
                      <>
                    <select value={selectedFilters[filterKey]?.condition} onChange={(e) => handleConditionChange(filterKey, e.target.value)}>
                          {filter[filterKey].map((condition) => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                        <input type="text" placeholder="Enter value" value={selectedFilters[filterKey]?.value || ""} onChange={(e) => handleValueChange(filterKey, e.target.value)} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Dropdown for Filter Views */}
            {/* Dropdown for Filter Views */}
            <div className="dropdown">
              <button
                className="filter-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedView}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  {["All contacts", "My contacts", "Recent contacts"].map((view) => (
                    <p
                      key={view}
                      className={selectedView === view ? "active-filter" : ""}
                      onClick={() => setSelectedView(view)}
                    >
                      {view}
                    </p>
                  ))}
                  <Link to="/contact_view" className="create-view">
                    + Create View
                  </Link>
                </div>
              )}
            </div>
            <Link to="/contactedit_view" className="edit-link" style={{ marginLeft: "3px", color: "black", textDecoration: "underline" }}>
              Edit
            </Link>
          </div>
          <div className="header-right">
            <input type="file" accept=".csv, .xlsx" style={{ display: "none" }} id="fileUpload" />
            <label htmlFor="fileUpload" className="import-btn">Import</label>
            <button className="add-btn" onClick={() => navigate("/contactpage")}>
              <Plus size={14} style={{ gap: "2px" }} /> Add contact
            </button>
            <div className="more-dropdown">
              <button className="contactmore-btn" onClick={() => setMoredropdownOpen(!moredropdownOpen)}>
                <EllipsisVertical size={20} strokeWidth={2.5} />
              </button>
              {moredropdownOpen && (
                <div className="more-dropdown-content">
                  <p onClick={() => console.log("Deduplicate contacts")}>Deduplicate contacts</p>
                  <p onClick={() => console.log("Mass Update")}>Mass Update</p>
                  <p onClick={() => console.log("Mass Delete")}>Mass Delete</p>
                  <p>Drafts</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="contacts-container">
          <div className="search-container1">
            <input
              type="text"
              placeholder="Search contacts"
              value={search}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input1"
            />
            <FiSearch className="search-icon1" />
          </div>
          <div className="custom-dropdown">
            <div className="dropdown-selected" onClick={() => setRecordsDropdownOpen(!recordsDropdownOpen)}>
              {recordsPerPage} Records per page
              <ChevronDown size={24} color="#032b26" strokeWidth={3} absoluteStrokeWidth />
            </div>
            {recordsDropdownOpen && (
              <div className="dropdown-menu">
                {[5, 10, 20, 50].map((num) => (
                  <div
                    key={num}
                    className="dropdown-item"
                    onClick={() => {
                      setRecordsPerPage(num);  // ✅ Update records per page
                      setCurrentPage(1);  // ✅ Reset to first page
                      setRecordsDropdownOpen(false); // ✅ Close dropdown
                    }}
                  >
                     {num} 
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="contactcolumn-selector">
            <div className="contactbutton-group">
              <button onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)} className="icon-contactbutton">
                <Table size={20} /> <Plus size={14} />
              </button>
              <button className="delete-btn" onClick={handleDeleteSelected} disabled={selectedRows.length === 0}>
                <X size={16} /> {/* Cross icon */}
              </button>
              {columnsDropdownOpen && (
                <div className="dropdown-content columns-dropdown">
                  {allFields.map((field) => (
                           <label key={field} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={SelectedContacts.includes(field)}
                        onChange={() => toggleColumnSelection(field)}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          {loading ? (
            <p>Loading contacts...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : contacts.length === 0 ? (
            <p>No contacts found.</p>
          ) : (
            <>
              {/* Table Rendering */}
              <table className="contacts-table">
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          checked={
            selectedRows.length === filteredContacts.length &&
            selectedRows.length > 0
          }
          onChange={handleSelectAll}
        />
      </th>
      {SelectedContacts.map((key, index) => (
        <th key={index}>{key}</th>
      ))}
    </tr>
  </thead>
  <tbody>
  {currentContacts.map((contact) => (
    <tr key={contact.contactId}>
      <td>
        
        <input
          type="checkbox"
          checked={selectedRows.includes(contact.contactId)}
          onChange={() => handleRowSelection(contact.contactId)}
        />
      </td>
      {SelectedContacts.map((key, index) => (
        <td key={index}>{contact[key] || "-"}</td>
      ))}
    </tr>
  ))}
</tbody>

</table>

              <p className="total-count">Total contacts: {filteredContacts.length}</p>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  «First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  ‹Prev
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      className={`page ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next›
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last»
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
