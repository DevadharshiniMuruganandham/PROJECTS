import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Dashboard</h1>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/create-contact")}
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(180deg, #019d88, #0d2e26)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Go to Clients
        </button>
        <button
          onClick={() => navigate("/Client-listings")}
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(180deg, #019d88, #0d2e26)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Go to Client Listings
        </button>
        <button
          onClick={() => navigate("/bench-employee-selection")}
          style={{
            padding: "10px 20px",
            margin: "10px",
            background: "linear-gradient(180deg, #019d88, #0d2e26)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
        CompanyCandidate
        </button>

      </div>
    </div>
  );
};

export default HomePage;
