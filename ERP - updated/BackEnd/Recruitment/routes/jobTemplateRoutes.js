const express = require("express");
const {
  createJobTemplate,
  getJobTemplates,
  // getJobTemplateById,
  deleteJobTemplate,
} = require("../controllers/jobTemplateController");

const router = express.Router();

router.post("/", createJobTemplate);
router.get("/", getJobTemplates);
// router.get("/jobtemplate/:id", getJobTemplateById);
router.delete("/jobtemplate/:id", deleteJobTemplate);

module.exports = router;
