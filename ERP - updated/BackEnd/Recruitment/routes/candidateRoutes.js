const express = require("express");
const router = express.Router();
const { createCandidate, uploadFiles } = require("../controllers/candidateController");
const upload = require("../middleware/uploadMiddleware");

// ✅ Route to create a candidate (NO FILE UPLOADS HERE)
router.post("/create", upload.none(), async (req, res) => {
  try {
    await createCandidate(req, res);
  } catch (error) {
    console.error("❌ Error in candidate creation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Route to upload files AFTER candidate is created
router.post("/uploadFiles", upload.array("files", 5), async (req, res) => {
  try {
    await uploadFiles(req, res);
  } catch (error) {
    console.error("❌ Error in file upload:", error);
    res.status(500).json({ message: "File Upload Failed" });
  }
});

module.exports = router;
