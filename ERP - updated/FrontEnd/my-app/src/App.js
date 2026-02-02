import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Recruitment/components/Sidebar";
import LoginPage from "./Recruitment/components/LoginPage";
import HomePage from "./Recruitment/components/Home";
import JobOpeningForm from "./Recruitment/components/JobOpeningForm";
import Settings from "./Recruitment/components/Settings";
import JobListings from "./Recruitment/components/JobListings";
import JobCreate from "./Recruitment/components/JobCreate";
import ForgotPassword from "./Recruitment/components/ForgotPassword";
import CandidateOpenPage from "./Recruitment/components/CandidateCreate";
import CandidateForm from "./Recruitment/components/CandidateForm";
import ClientCreation from "./Recruitment/components/ClientCreation";
import ClientListings from "./Recruitment/components/ClientListings";
import ClientColumn from "./Recruitment/components/ClientColumn";
import ClientView from "./Recruitment/components/ClientView";
import CompanyCandidate from "./Bench_Sales/Components/BenchEmployeeForm";
import BenchEmployeeSelection from "./Bench_Sales/Components/Bench_Sales_Selection";
import BenchEmployeeForm from "./Bench_Sales/Components/BenchEmployeeForm";
import CreateContact from"./Recruitment/components/ContactCreate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Contactlisting from "./Recruitment/components/contactlisting";
import Contactedit_view from "./Recruitment/components/contactedit_view";
import Jobtemplate from "./Recruitment/components/NewJobTemplate";
import JobTemplatesPage from "./Recruitment/components/templates" ;
import "./App.css";

const App = () => {
  const [isPinned, setIsPinned] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const location = useLocation();

  // Check authentication on mount & route change
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const togglePinned = () => setIsPinned(!isPinned);

  return (
    <div className={`app-container ${isAuthenticated ? "" : "login-wrapper"}`}>
      {isAuthenticated && <Sidebar isPinned={isPinned} togglePinned={togglePinned} />}
      <div className={`main-content ${isPinned ? "" : "shifted"}`}>
        <ToastContainer />

        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* Main Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
          <Route path="/job-openings" element={isAuthenticated ? <JobOpeningForm /> : <Navigate to="/" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/" />} />
          <Route path="/job-create" element={isAuthenticated ? <JobCreate /> : <Navigate to="/" />} />
          <Route path="/job-listings" element={isAuthenticated ? <JobListings /> : <Navigate to="/" />} />
          <Route path="/candidate" element={isAuthenticated ? <CandidateOpenPage /> : <Navigate to="/" />} />
          <Route path="/candidate-form" element={isAuthenticated ? <CandidateForm /> : <Navigate to="/" />} />
          <Route path="/client-creation" element={isAuthenticated ? <ClientCreation /> : <Navigate to="/" />} />
          <Route path="/client-listings" element={isAuthenticated ? <ClientListings /> : <Navigate to="/" />} />
          <Route path="/client-column" element={isAuthenticated ? <ClientColumn /> : <Navigate to="/" />} />
          <Route path="/client-view" element={isAuthenticated ? <ClientView /> : <Navigate to="/" />} />
          <Route path="/company-candidate" element={isAuthenticated ? <CompanyCandidate /> : <Navigate to="/" />} />
          <Route path="/create-contact" element={isAuthenticated ? <CreateContact /> : <Navigate to="/" />} />
          <Route path="/Contactlisting" element={isAuthenticated ? <Contactlisting/> : <Navigate to="/" />} />
          <Route path="/Contactedit_view" element={isAuthenticated ? <Contactedit_view/> : <Navigate to="/" />} />
          <Route path="/jobtemplate" element={isAuthenticated ? <Jobtemplate/> : <Navigate to="/" />} />
          <Route path="/template" element={isAuthenticated ? <JobTemplatesPage/> : <Navigate to="/" />} />
          {/* Bench Sales Routes */}
          <Route path="/bench-employee-selection" element={<BenchEmployeeSelection />} />
          <Route path="/bench-form" element={<BenchEmployeeForm />} />

          {/* Catch-All Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
