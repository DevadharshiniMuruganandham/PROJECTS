import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUsers,
  LuBriefcase,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { FaAngleDown, FaAngleUp, FaThumbtack } from "react-icons/fa";
import "../styles/Sidebar.css";
import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
import prophecyLogo from "../Assets/images/prophecy-logo.png";

const Sidebar = () => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // Track open submenu
  const navigate = useNavigate();

  const isExpanded = isPinned || isHovered;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Toggle submenu
  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return (
    <div className="sidebar-container">
      <div
        className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={prophecyLogo2} alt="Logo" className="initial-logo" />
            {isExpanded && <img src={prophecyLogo} alt="Logo" className="logo" />}
          </div>

          {/* Pin Button */}
          {isExpanded && (
            <button className="pin-button" onClick={() => setIsPinned(!isPinned)}>
              <FaThumbtack className={`pin-icon ${isPinned ? "pinned" : ""}`} />
            </button>
          )}
        </div>

        {/* Sidebar Menu */}
        <ul className="menu">
          <li onClick={() => navigate("/home")}>
            <LuLayoutDashboard className="icon" />
            {isExpanded && <span className="menu-text">Dashboard</span>}
          </li>

          {/* Dynamic Submenu Example */}
          <li
            className={`menu-item ${openSubmenu === "job" ? "open" : ""}`}
            onClick={() => toggleSubmenu("job")}
          >
            <LuBriefcase className="icon" />
            {isExpanded && <span className="menu-text">Recruitment</span>}
            {isExpanded && (
              <span className="submenu-icon">
                {openSubmenu === "job" ? <FaAngleUp /> : <FaAngleDown />}
              </span>
            )}
          </li>

          {/* Jobs Submenu */}
          {openSubmenu === "job" && (
            <ul className="submenu">
              <li className="submenu-item" onClick={() => navigate("/job-create")}>
                Job Postings
              </li>
              <li className="submenu-item" onClick={() => navigate("/job-listings")}>
                Job Listings
              </li>
              <li className="submenu-item" onClick={() => navigate("/candidate")}>
                Candidate
              </li>
              <li className="submenu-item" onClick={() => navigate("/client-creation")}>
                Client Creation
              </li>
              <li className="submenu-item" onClick={() => navigate("/Client-listings")}>
                Client Listings
              </li>
              <li className="submenu-item" onClick={() => navigate("/create-contact")}>
                Contact
              </li>
            </ul>
          )}

          <li
            className={`menu-item ${openSubmenu === "users" ? "open" : ""}`}
            onClick={() => toggleSubmenu("users")}
          >
            <LuUsers className="icon" />
            {isExpanded && <span className="menu-text">Bench Sales</span>}
            {isExpanded && (
              <span className="submenu-icon">
                {openSubmenu === "users" ? <FaAngleUp /> : <FaAngleDown />}
              </span>
            )}
          </li>

          {/* Users Submenu */}
          {openSubmenu === "users" && (
            <ul className="submenu">
             
              <li className="submenu-item" onClick={() => navigate("/bench-employee-selection")}>
                BenchEmployee             </li>
            </ul>
          )}

          <li onClick={() => navigate("/bench-sales")}>
            <LuBriefcase className="icon" />
            {isExpanded && <span className="menu-text">Accounting</span>}
          </li>
        </ul>

        {/* Settings & Logout */}
        <div className="settings-section">
          <ul>
            <li onClick={() => navigate("/settings")}>
              <LuSettings className="icon" />
              {isExpanded && <span className="menu-text">Settings</span>}
            </li>
            <li onClick={handleLogout}>
              <LuLogOut className="icon" />
              {isExpanded && <span className="menu-text">Log Out</span>}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
