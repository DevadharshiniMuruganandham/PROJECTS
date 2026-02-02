const { sql, poolPromise } = require("../../config/db");

// Create a new client
const createClient = async (req, res) => {
    try {
        console.log("📩 Received data:", req.body);
        const {
            clientName, industry, parentClient,
            website, contactNumber, accountManager, fax,
            billingStreet, billingCity, billingProvince, billingCode, billingCountry,
            shippingStreet, shippingCity, shippingProvince, shippingCode, shippingCountry
        } = req.body;

        const createdBy = req.user?.userId; // ✅ Get authenticated user ID
        if (!createdBy) {
            return res.status(401).json({ error: "Unauthorized: User ID is required" });
        }

        let pool = await poolPromise; 

        // Insert Client record
        const clientResult = await pool.request()
            .input("clientName", sql.NVarChar, clientName)
            .input("industry", sql.NVarChar, industry)
            .input("parentClientId", sql.Int, isNaN(parentClient) ? null : parseInt(parentClient))
            .input("website", sql.NVarChar, website)
            .input("createdBy", sql.Int, createdBy) // ✅ Store user ID
            .query(`
                INSERT INTO Clients (clientName, industry, parentClientId, website, createdBy)
                OUTPUT INSERTED.clientId
                VALUES (@clientName, @industry, @parentClientId, @website, @createdBy)
            `);

        const clientId = clientResult.recordset[0].clientId;

        // Insert Client Contact Information
        await pool.request()
            .input("clientId", sql.Int, clientId)
            .input("contactNumber", sql.NVarChar, contactNumber)
            .input("accountManager", sql.NVarChar, accountManager)
            .input("fax", sql.NVarChar, fax)
            .query(`
                INSERT INTO ClientContacts (clientId, contactNumber, accountManager, fax)
                VALUES (@clientId, @contactNumber, @accountManager, @fax)
            `);

        // Insert Billing Address Information
        await pool.request()
            .input("clientId", sql.Int, clientId)
            .input("street", sql.NVarChar, billingStreet)
            .input("city", sql.NVarChar, billingCity)
            .input("province", sql.NVarChar, billingProvince)
            .input("postalCode", sql.NVarChar, billingCode)
            .input("country", sql.NVarChar, billingCountry)
            .query(`
                INSERT INTO BillingAddresses (clientId, street, city, province, postalCode, country)
                VALUES (@clientId, @street, @city, @province, @postalCode, @country)
            `);

        // Insert Shipping Address Information
        await pool.request()
            .input("clientId", sql.Int, clientId)
            .input("street", sql.NVarChar, shippingStreet)
            .input("city", sql.NVarChar, shippingCity)
            .input("province", sql.NVarChar, shippingProvince)
            .input("postalCode", sql.NVarChar, shippingCode)
            .input("country", sql.NVarChar, shippingCountry)
            .query(`
                INSERT INTO ShippingAddresses (clientId, street, city, province, postalCode, country)
                VALUES (@clientId, @street, @city, @province, @postalCode, @country)
            `);

        res.status(201).json({ message: "Client created successfully!", clientId });
    } catch (error) {
        console.error("❌ Error creating client:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Fetch all clients
const getClients = async (req, res) => {
    try {
        const userId = req.user?.userId; // Get logged-in user ID
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID is required" });
        }

        let pool = await poolPromise;
        let result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT 
                    c.clientId, c.clientName, c.industry, c.parentClientId, 
                    c.website, c.createdAt,
                    cc.contactNumber, cc.accountManager, cc.fax,
                    ba.street AS billingStreet, ba.city AS billingCity, 
                    ba.province AS billingProvince, ba.postalCode AS billingPostalCode, ba.country AS billingCountry,
                    sa.street AS shippingStreet, sa.city AS shippingCity, 
                    sa.province AS shippingProvince, sa.postalCode AS shippingPostalCode, sa.country AS shippingCountry
                FROM Clients c
                LEFT JOIN ClientContacts cc ON c.clientId = cc.clientId
                LEFT JOIN BillingAddresses ba ON c.clientId = ba.clientId
                LEFT JOIN ShippingAddresses sa ON c.clientId = sa.clientId
                WHERE c.createdBy = @userId -- ✅ Only show clients created by logged-in user
                ORDER BY c.createdAt DESC
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("❌ Error fetching clients:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};


const deleteClients = async (req, res) => {
    const { clientIds } = req.body;

    if (!clientIds || clientIds.length === 0) {
        return res.status(400).json({ message: "No client IDs provided" });
    }

    try {
        let pool = await poolPromise;

        // Convert array of client IDs into a format SQL Server understands
        const idsString = clientIds.join(",");

        // Delete clients with cascading delete affecting dependent tables
        await pool.request()
            .query(`DELETE FROM Clients WHERE clientId IN (${idsString})`);

        res.status(200).json({ message: "Clients deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting clients:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

module.exports = { deleteClients, createClient, getClients };

