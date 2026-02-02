const express = require("express");
const { createClient, getClients, deleteClients } = require("../controllers/jobClientController");
const { authenticateToken } = require("../middleware/authMiddleware"); // Import authentication middleware

const router = express.Router();

// Protect these routes with authentication
router.post("/", authenticateToken, createClient);
router.get("/", authenticateToken, getClients);
router.delete("/", authenticateToken, deleteClients);

module.exports = router;
