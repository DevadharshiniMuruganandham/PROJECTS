import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import "../styles/CandidateCreate.css";

const CandidateOpenPage = () => {
  const navigate = useNavigate(); 

  const handleCreateCandidate = () => {
    navigate('/candidate-form');
  };

  const handleImportCandidate = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`File selected: ${file.name}`);
    }
  };

  return (
    <div className="candidate-open-container">
      <div className="button-container">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleCreateCandidate}
          className="candidate-button create-candidate"
        >
          Create Candidate 
        </motion.button>

        <motion.label
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="candidate-button import-candidate import-label"
        >
          Import Candidate 
          <input type="file" accept=".csv,.xlsx,.json" className="hidden-input" onChange={handleImportCandidate} />
        </motion.label>
      </div>
    </div>
  );
};

export default CandidateOpenPage;
