import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/JobListings.css";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { MdDelete } from "react-icons/md";
import { FaPrint, FaEllipsisV, FaTable, FaSortAlphaDown, FaFilter } from "react-icons/fa";
import Pagination from "../utils/Pagination";
import { generatePageNumbers, RowsPerPageSelector } from "../utils/paginationUtils";
import { availableColumns } from "../config/filterConfig";
import {
  deleteSingleRow,
  deleteSelectedRows,
  handleSingleDelete,
  handleMultipleDelete,
} from "../utils/jobDeletion";
import JobFilter from "./jobFilter";

const JobListings = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]); // ✅ Moved above tempSelectedColumns
  const [tempSelectedColumns, setTempSelectedColumns] = useState(selectedColumns);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const dropdownRef = useRef(null);


  
    useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/jobs/job-openings", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
          const data = await response.json();
          console.log("Fetched Jobs Data:", data); // Debugging
    
          setJobs(data);
          setFilteredJobs(data);
        } catch (error) {
          console.error("Error fetching jobs:", error);
        }
      };
      fetchJobs();
    }, []);
    
    
    const filterRef = useRef(null);
  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);
  const indexOfLastJob = currentPage * rowsPerPage;
  const indexOfFirstJob = indexOfLastJob - rowsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const toggleRowSelection = (jobId) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(jobId) ? newSelection.delete(jobId) : newSelection.add(jobId);
      return newSelection;
    });
  };

  const sortJobs = (key) => {
    if (!key) return;

    setFilteredJobs((prevJobs) => {
      return [...prevJobs].sort((a, b) => {
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
  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };
  
  const handleTempColumnChange = (colKey) => {
    setTempSelectedColumns((prev) =>
      prev.includes(colKey) ? prev.filter((key) => key !== colKey) : [...prev, colKey]
    );
  };
  const handleSelectAllColumns = () => {
    if (tempSelectedColumns.length === availableColumns.length) {
      setTempSelectedColumns([]); // Deselect all
    } else {
      setTempSelectedColumns(availableColumns.map((col) => col.key)); // Select all
    }
  };

  const handleBulkDelete = async () => {
    await deleteSelectedRows(
      Array.from(selectedRows),
      handleMultipleDelete,
      jobs,
      setJobs,
      setFilteredJobs,
      setSelectedRows
    );
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        filterRef.current && !filterRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="job-page-container">
       <div className="column-selector">
          <div className="dropdown">
            
            {dropdownOpen && (
              <div  ref={dropdownRef}  className="dropdown-menu">
                {/* Select All Checkbox */}
                <div className="dropdown-item select-all">
                  <input
                    type="checkbox"
                    id="selectAllColumns"
                    checked={tempSelectedColumns.length === availableColumns.length}
                    onChange={handleSelectAllColumns}
                  />
                  <label htmlFor="selectAllColumns"><strong>Select All</strong></label>
                </div>

                {availableColumns.map((col) => (
                  <div key={col.key} className="dropdown-item">
                    <input
                      type="checkbox"
                      id={col.key}
                      checked={tempSelectedColumns.includes(col.key)}
                      onChange={() => handleTempColumnChange(col.key)}
                    />
                    <label htmlFor={col.key}>{col.label}</label>
                  </div>
                ))}

                <button className="ok-button" onClick={() => {
                  setSelectedColumns(tempSelectedColumns);
                  setDropdownOpen(false);
                }}>
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      <div  className="filter-container">
    
       {showFilters && (
        <div ref={filterRef} className="filter-sidebar-active">
          <JobFilter jobs={jobs} setFilteredJobs={setFilteredJobs} />
        </div>
      )}
      </div>
      <div className="job-listings-container">
      <h2>All Job Openings</h2>
      
        <div className="toolbar">
         
<div className="action-buttons-job">
<button className="filter-button" onClick={() => setShowFilters((prev) => !prev)}>
          <FaFilter size={20} /> Filters
        </button>
        
            <div className="import-container">
              <input type="file" accept=".csv, .xlsx" style={{ display: "none" }} id="fileUpload" />
              <label htmlFor="fileUpload" className="import-button">Import▼</label>
            
            </div>

            <button className="more-options"><FaEllipsisV /></button>
            <button className="print-btn" onClick={() => window.print()}><FaPrint /></button>
            <button className="dropdown-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              Manage Data ▼
            </button>
            <button className="table-view"><FaTable /></button>
            <button className="delete-selected-btn" onClick={handleBulkDelete} disabled={selectedRows.size === 0}>
              <MdDelete size={20} /> 
            </button>
            <button className="sort-btn" onClick={() => sortJobs(sortConfig.key)}><FaSortAlphaDown /></button>
            <RowsPerPageSelector rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
          
          </div>
        </div>

       


        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedRows(e.target.checked ? new Set(jobs.map((job) => job.id)) : new Set())
                  }
                />
              </th>
              <th onClick={() => sortJobs("id")}>Job ID</th>
              <th onClick={() => sortJobs("postingTitle")}>Job Posting Title</th>
              {selectedColumns.map((col) => (
                <th key={col} onClick={() => sortJobs(col)}>
                  {availableColumns.find((c) => c.key === col)?.label}
                </th>
              ))}
              {selectedRows.size > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(job.id)}
                      onChange={() => toggleRowSelection(job.id)}
                    />
                  </td>
                  <td>{job.id}</td>
                  <td><Link to={`/job-details/${job.id}`}>{job.postingTitle}</Link></td>
                  

                  {selectedColumns.map((col) => (
          <td key={col}>
          {col === "dateOpened" && job.dateOpened
            ? isValidDate(job.dateOpened)
              ? new Date(job.dateOpened).toISOString().split("T")[0]
              : "Invalid Date"
            : col === "targetDate" && job.targetDate
            ? isValidDate(job.targetDate)
              ? new Date(job.targetDate).toISOString().split("T")[0]
              : "Invalid Date"
            : col === "jobDescription"
            ? <p dangerouslySetInnerHTML={{ __html: job[col] || "" }}></p>
            : typeof job[col] === "object" && job[col] !== null
            ? JSON.stringify(job[col]) // Convert object to string
            : job[col] || "N/A"}
        </td>
        
        
        ))}
                  {selectedRows.has(job.id) && (
                    <td>
                      <button className="delete-icon-btn" onClick={() => deleteSingleRow(job.id, handleSingleDelete, jobs, setJobs, setFilteredJobs, setSelectedRows)}>
                        <MdDelete size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan="7">No job openings available.</td></tr>
            )}
          </tbody>
        </table>

        <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
      </div>
    </div>
  );
};

export default JobListings;
