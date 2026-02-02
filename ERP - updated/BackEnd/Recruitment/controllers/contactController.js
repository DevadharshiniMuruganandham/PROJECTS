
const { sql, poolPromise } = require("../../config/db");

// Get all contacts with addresses
exports.getAllContacts = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.*, 
                   m.street AS mailingStreet, m.city AS mailingCity, m.province AS mailingProvince, 
                   m.postalCode AS mailingPostalCode, m.country AS mailingCountry, 
                   o.street AS otherStreet, o.city AS otherCity, o.province AS otherProvince, 
                   o.postalCode AS otherPostalCode, o.country AS otherCountry
            FROM Contacts c
            LEFT JOIN MailingAddresses m ON c.contactId = m.contactId
            LEFT JOIN OtherAddresses o ON c.contactId = o.contactId
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Error fetching contacts", error: error.message });
    }
};

// Get a single contact by ID
exports.getContactById = async (req, res) => {
    const { contactId } = req.params;

    if (!contactId || isNaN(contactId)) {
        return res.status(400).json({ message: "Invalid contact ID" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("contactId", sql.Int, contactId)
            .query(`
                SELECT c.*, 
                       m.street AS mailingStreet, m.city AS mailingCity, m.province AS mailingProvince, 
                       m.postalCode AS mailingPostalCode, m.country AS mailingCountry, 
                       o.street AS otherStreet, o.city AS otherCity, o.province AS otherProvince, 
                       o.postalCode AS otherPostalCode, o.country AS otherCountry
                FROM Contacts c
                LEFT JOIN MailingAddresses m ON c.contactId = m.contactId
                LEFT JOIN OtherAddresses o ON c.contactId = o.contactId
                WHERE c.contactId = @contactId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.status(500).json({ message: "Error fetching contact", error: error.message });
    }
};

// Create a new contact with addresses
exports.createContact = async (req, res) => {
    const {
        firstName, lastName, department, fax, clientName, email, secondaryEmail, jobTitle, workPhone, mobile, source, contactOwner, isPrimaryContact, emailOptOut, description,
        mailingStreet, mailingCity, mailingProvince, mailingPostalCode, mailingCountry,
        otherStreet, otherCity, otherProvince, otherPostalCode, otherCountry
    } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Insert contact
        const contactResult = await transaction.request()
            .input("firstName", sql.NVarChar, firstName)
            .input("lastName", sql.NVarChar, lastName)
            .input("department", sql.NVarChar, department)
            .input("fax", sql.NVarChar, fax)
            .input("clientName", sql.NVarChar, clientName)
            .input("email", sql.NVarChar, email)
            .input("secondaryEmail", sql.NVarChar, secondaryEmail)
            .input("jobTitle", sql.NVarChar, jobTitle)
            .input("workPhone", sql.NVarChar, workPhone)
            .input("mobile", sql.NVarChar, mobile)
            .input("source", sql.NVarChar, source)
            .input("contactOwner", sql.NVarChar, contactOwner)
            .input("isPrimaryContact", sql.Bit, isPrimaryContact)
            .input("emailOptOut", sql.Bit, emailOptOut)
            .input("description", sql.Text, description)
            .query(`
                INSERT INTO Contacts (firstName, lastName, department, fax, clientName, email, secondaryEmail, jobTitle, workPhone, mobile, source, contactOwner, isPrimaryContact, emailOptOut, description) 
                OUTPUT INSERTED.contactId VALUES (@firstName, @lastName, @department, @fax, @clientName, @email, @secondaryEmail, @jobTitle, @workPhone, @mobile, @source, @contactOwner, @isPrimaryContact, @emailOptOut, @description)
            `);
        
        const contactId = contactResult.recordset[0].contactId;

        // Insert Mailing Address if provided
        if (mailingStreet) {
            await transaction.request()
                .input("contactId", sql.Int, contactId)
                .input("street", sql.NVarChar, mailingStreet)
                .input("city", sql.NVarChar, mailingCity)
                .input("province", sql.NVarChar, mailingProvince)
                .input("postalCode", sql.NVarChar, mailingPostalCode)
                .input("country", sql.NVarChar, mailingCountry)
                .query(`INSERT INTO MailingAddresses (contactId, street, city, province, postalCode, country) 
                        VALUES (@contactId, @street, @city, @province, @postalCode, @country)`);
        }

        // Insert Other Address if provided
        if (otherStreet) {
            await transaction.request()
                .input("contactId", sql.Int, contactId)
                .input("street", sql.NVarChar, otherStreet)
                .input("city", sql.NVarChar, otherCity)
                .input("province", sql.NVarChar, otherProvince)
                .input("postalCode", sql.NVarChar, otherPostalCode)
                .input("country", sql.NVarChar, otherCountry)
                .query(`INSERT INTO OtherAddresses (contactId, street, city, province, postalCode, country) 
                        VALUES (@contactId, @street, @city, @province, @postalCode, @country)`);
        }

        await transaction.commit();
        res.status(201).json({ message: "Contact created successfully", contactId });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Error creating contact", error: error.message });
    }
};

// Update contact
exports.updateContact = async (req, res) => {
    const { contactId } = req.params;
    const { firstName, lastName, email } = req.body;

    if (!contactId || isNaN(contactId)) {
        return res.status(400).json({ message: "Invalid contact ID" });
    }
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("contactId", sql.Int, contactId)
            .input("firstName", sql.NVarChar, firstName)
            .input("lastName", sql.NVarChar, lastName)
            .input("email", sql.NVarChar, email)
            .query(`UPDATE Contacts SET firstName = @firstName, lastName = @lastName, email = @email, updatedAt = GETDATE() 
                    WHERE contactId = @contactId`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact updated successfully" });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({ message: "Error updating contact", error: error.message });
    }
};


// exports.deleteContact  = async (req, res) => {
//     try {
//         const { contactIds } = req.body; // ✅ Get IDs from request body
//         console.log("Incoming Delete Request:", req.body);

//         if (!contactIds || contactIds.length === 0) {
//             return res.status(400).json({ message: "No contacts provided for deletion" });
//         }

//         // ✅ For Sequelize:
//         await Contact.destroy({ where: { contactId: contactIds } });

//         // ✅ For MongoDB:
//         // await Contact.deleteMany({ _id: { $in: contactIds } });

//         res.status(200).json({ message: "Contacts deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// };
exports.deleteContact = async (req, res) => {
    try {
        const { contactIds } = req.body;

        if (!contactIds || contactIds.length === 0) {
            return res.status(400).json({ message: "No contacts provided for deletion" });
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Dynamically generate parameter placeholders
        const placeholders = contactIds.map((id, index) => `@id${index}`).join(", ");

        // Bind each ID to a parameter to prevent SQL injection
        contactIds.forEach((id, index) => {
            request.input(`id${index}`, sql.Int, id);
        });

        const query = `DELETE FROM Contacts WHERE contactId IN (${placeholders})`;
        console.log("Executing Query:", query); // ✅ Debugging

        await request.query(query);

        res.status(200).json({ message: "Contacts deleted successfully" });
    } catch (error) {
        console.error("Error deleting contacts:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
