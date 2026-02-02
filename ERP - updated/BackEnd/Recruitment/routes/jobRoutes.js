const express = require("express");
const { getJobOpening, createJobOpening, deleteJobOpening } = require("../controllers/jobController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/job-openings", authenticateToken, getJobOpening);
router.post("/job-openings", authenticateToken, createJobOpening);
router.delete("/delete", authenticateToken, deleteJobOpening);

module.exports = router;
