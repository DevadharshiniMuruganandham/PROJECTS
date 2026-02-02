
const express = require("express");
const router = express.Router();
const { getAllContacts, getContactById, createContact, updateContact, deleteContact } = require("../../Recruitment/controllers/contactController"); // ✅ Correct Import

// Define routes
router.get("/", getAllContacts);
router.get("/:contactId", getContactById);
router.post("/", createContact);
router.put("/:contactId", updateContact);


// ✅ Define the bulk delete route correctly
router.post("/delete-bulk", deleteContact );




module.exports = router;
