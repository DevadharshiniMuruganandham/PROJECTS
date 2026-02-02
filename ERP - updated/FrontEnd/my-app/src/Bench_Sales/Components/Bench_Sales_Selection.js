import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/BenchSalesSelection.css"
const BenchEmployeeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="selection-container">
      
      <div className="button-container">
        <button
          className="upload-resume"
          onClick={() => navigate("/bench-form?mode=upload")}
        >
          Upload Resume
        </button>
        <button
          className="fill-manually"
          onClick={() => navigate("/bench-form?mode=manual")}
        >
          Fill Manually
        </button>
      </div>
    </div>
  );
};

export default BenchEmployeeSelection;
