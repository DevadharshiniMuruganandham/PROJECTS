const { sql, poolPromise } = require("../../config/db");
const { toCamelCase } = require("../utils/formatUtils");

// ✅ Create Job Opening
const createJobOpening = async (req, res) => {
  const jobData = toCamelCase(req.body);
  let pool;
  let transaction;

  try {
    pool = await poolPromise;
    transaction = pool.transaction();
    await transaction.begin();

    console.log("🔹 Incoming Job Data:", req.body);
    console.log("🔹 Authenticated User:", req.user);

    const createdBy = req.user?.userId;
    if (!createdBy) {
      console.error("❌ Missing createdBy. Unauthorized request.");
      return res.status(401).json({ error: "Unauthorized: User ID is required" });
    }

    // Insert into JobOpening
    const jobOpeningResult = await transaction.request()
      .input("postingTitle", sql.VarChar, jobData.postingTitle)
      .input("clientName", sql.VarChar, jobData.clientName)
      .input("contactName", sql.VarChar, jobData.contactName)
      .input("accountManagerId", sql.VarChar, jobData.accountManagerId)
      .input("recruiterId", sql.VarChar, jobData.recruiterId)
      .input("dateOpened", sql.Date, jobData.dateOpened || null)
      .input("targetDate", sql.Date, jobData.targetDate || null)
      .input("jobTypeId", sql.VarChar, jobData.jobTypeId)
      .input("jobStatusId", sql.VarChar, jobData.jobStatusId)
      .input("industry", sql.VarChar, jobData.industry)
      .input("salary", sql.Decimal, jobData.salary || 0)
      .input("workExperience", sql.VarChar, jobData.workExperience)
      .input("createdBy", sql.Int, createdBy) // ✅ Use authenticated user
      .query(`
        INSERT INTO JobOpenings
          (postingTitle, clientName, contactName, accountManagerId, recruiterId, 
          dateOpened, targetDate, jobTypeId, jobStatusId, industry, salary, workExperience, createdBy) 
        OUTPUT INSERTED.id 
        VALUES 
          (@postingTitle, @clientName, @contactName, @accountManagerId, @recruiterId, 
          @dateOpened, @targetDate, @jobTypeId, @jobStatusId, @industry, @salary, @workExperience, @createdBy)
      `);

    const jobId = jobOpeningResult.recordset[0].id;

    // Insert into AddressInformation
    await transaction.request()
      .input("jobId", sql.Int, jobId)
      .input("city", sql.VarChar, jobData.city)
      .input("countryId", sql.VarChar, jobData.countryId)
      .input("province", sql.VarChar, jobData.province)
      .input("postalCode", sql.VarChar, jobData.postalCode)
      .query(`
        INSERT INTO AddressInformation (jobId, city, countryId, province, postalCode) 
        VALUES (@jobId, @city, @countryId, @province, @postalCode)
      `);

    // Insert into ForecastDetails
    await transaction.request()
      .input("jobId", sql.Int, jobId)
      .input("numPositions", sql.Int, jobData.numPositions || 0)
      .input("revenuePerPosition", sql.Decimal, jobData.revenuePerPosition || 0)
      .input("expectedRevenue", sql.Decimal, jobData.expectedRevenue || 0)
      .input("actualRevenue", sql.Decimal, jobData.actualRevenue || 0)
      .query(`
        INSERT INTO ForecastDetails (jobId, numPositions, revenuePerPosition, expectedRevenue, actualRevenue) 
        VALUES (@jobId, @numPositions, @revenuePerPosition, @expectedRevenue, @actualRevenue)
      `);

    // Insert into JobDescriptions
    await transaction.request()
      .input("jobId", sql.Int, jobId)
      .input("jobDescription", sql.Text, jobData.jobDescription || "")
      .query(`
        INSERT INTO JobDescriptions (jobId, jobDescription) 
        VALUES (@jobId, @jobDescription)
      `);

    await transaction.commit();
    res.status(201).json({ message: "Job opening created successfully", jobId });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("SQL Error:", error);
    res.status(500).json({ error: "Failed to create job opening", details: error.message });
  }
};

// ✅ Fetch Job Openings (Only Show User's Own Jobs)
const getJobOpening = async (req, res) => {
  try {
    const userId = req.user?.userId; // Get logged-in user ID
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID is required" });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          jo.id, jo.postingTitle, jo.clientName, jo.contactName, 
          jo.accountManagerId, jo.recruiterId, jo.dateOpened, jo.targetDate, 
          jo.industry, jo.salary, jo.workExperience, jo.createdBy,
          fd.numPositions, fd.revenuePerPosition, fd.expectedRevenue, fd.actualRevenue, 
          ai.city, ai.province, ai.countryId, ai.postalCode, 
          jd.jobDescription
        FROM JobOpenings jo
        LEFT JOIN AddressInformation ai ON jo.id = ai.jobId
        LEFT JOIN ForecastDetails fd ON jo.id = fd.jobId
        LEFT JOIN JobDescriptions jd ON jo.id = jd.jobId
        WHERE jo.createdBy = @userId
        ORDER BY jo.id DESC
      `);

    // ✅ Format Dates Before Sending
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
    };

    const formattedJobs = result.recordset.map((job) => ({
      ...job,
      dateOpened: formatDate(job.dateOpened),
      targetDate: formatDate(job.targetDate),
    }));

    res.status(200).json(toCamelCase(formattedJobs));
  } catch (error) {
    console.error("Error fetching job openings:", error);
    res.status(500).json({ error: "Failed to fetch job openings" });
  }
};


// ✅ Update Job Opening
const updateJobOpening = async (req, res) => {
  const { id } = req.params;
  const jobData = toCamelCase(req.body);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, id)
      .input("postingTitle", sql.VarChar, jobData.postingTitle)
      .input("clientName", sql.VarChar, jobData.clientName)
      .input("contactName", sql.VarChar, jobData.contactName)
      .input("industry", sql.VarChar, jobData.industry)
      .input("salary", sql.Decimal, jobData.salary || 0)
      .input("workExperience", sql.VarChar, jobData.workExperience)
      .query(`
        UPDATE JobOpenings
        SET postingTitle = @postingTitle, clientName = @clientName, contactName = @contactName, 
            industry = @industry, salary = @salary, workExperience = @workExperience 
        WHERE id = @id
      `);

    res.status(200).json({ message: "Job opening updated successfully" });
  } catch (error) {
    console.error("Error updating job opening:", error);
    res.status(500).json({ error: "Failed to update job opening" });
  }
};

// ✅ Delete Job Openings
const deleteJobOpening = async (req, res) => {
  const jobIds = req.query.ids ? req.query.ids.split(",").map(id => parseInt(id, 10)) : [];

  if (jobIds.length === 0 || jobIds.some(isNaN)) {
    return res.status(400).json({ error: "Invalid job IDs provided for deletion" });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    jobIds.forEach((id, index) => request.input(`id${index}`, sql.Int, id));
    const idParams = jobIds.map((_, index) => `@id${index}`).join(", ");

    await request.query(`DELETE FROM JobOpenings WHERE id IN (${idParams})`);

    res.status(200).json({ message: "Job openings deleted successfully" });
  } catch (error) {
    console.error("Error deleting job openings:", error);
    res.status(500).json({ error: "Failed to delete job openings" });
  }
};

module.exports = { createJobOpening, getJobOpening, updateJobOpening, deleteJobOpening};
