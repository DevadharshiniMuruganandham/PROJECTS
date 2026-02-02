const { poolPromise, sql } = require("../../config/db");

exports.createCandidate = async (req, res) => {
  try {
    console.log("📥 Incoming Request Body:", req.body);
    console.log("📂 Uploaded File Details:", req.files);

    const {
      firstName,
      lastName,
      email,
      phone,
      mobile,
      website,
      secondaryEmail,
      fax,
      street,
      city,
      country,
      postalCode,
      province,
      experience,
      currentJobTitle,
      expectedSalary,
      skillSet,
      skypeID,
      highestQualification,
      currentEmployer,
      currentSalary,
      additionalInfo,
      linkedIn,
      twitter,
      facebook,
      education: formattedEducation = [],
      workexperience: formattedExperience = [],
    } = req.body;

    // 🔴 Check for required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: "❌ Missing required fields: First Name, Last Name, Email, or Phone" });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 🔹 Insert Candidate Details
      const candidateResult = await new sql.Request(transaction)
        .input("firstName", sql.NVarChar, firstName)
        .input("lastName", sql.NVarChar, lastName)
        .input("email", sql.NVarChar, email)
        .input("phone", sql.NVarChar, phone || null)
        .input("mobile", sql.NVarChar, mobile || null)
        .input("website", sql.NVarChar, website || null)
        .input("secondaryEmail", sql.NVarChar, secondaryEmail || null)
        .input("fax", sql.NVarChar, fax || null)
        .query(`
          INSERT INTO Candidates (firstName, lastName, email, phone, mobile, website, secondaryEmail, fax)
          OUTPUT INSERTED.candidateId
          VALUES (@firstName, @lastName, @email, @phone, @mobile, @website, @secondaryEmail, @fax)
        `);

      if (!candidateResult.recordset || candidateResult.recordset.length === 0) {
        throw new Error("Failed to retrieve Candidate ID");
      }

      const candidateId = candidateResult.recordset[0].candidateId;

      // 🔹 Insert Address Details
      await transaction.request()
        .input("candidateId", sql.Int, candidateId)
        .input("street", sql.NVarChar, street || null)
        .input("city", sql.NVarChar, city || null)
        .input("country", sql.NVarChar, country || null)
        .input("postalCode", sql.NVarChar, postalCode || null)
        .input("province", sql.NVarChar, province || null)
        .query(`
          INSERT INTO CandidateAddress (candidateId, street, city, country, postalCode, province)
          VALUES (@candidateId, @street, @city, @country, @postalCode, @province)
        `);

      // 🔹 Insert Professional Details
      await transaction.request()
        .input("candidateId", sql.Int, candidateId)
        .input("experience", sql.Int, experience || 0)
        .input("currentJobTitle", sql.NVarChar, currentJobTitle || null)
        .input("expectedSalary", sql.Decimal(10, 2), expectedSalary || 0)
        .input("skillSet", sql.NVarChar, skillSet || null)
        .input("skypeID", sql.NVarChar, skypeID || null)
        .input("highestQualification", sql.NVarChar, highestQualification || null)
        .input("currentEmployer", sql.NVarChar, currentEmployer || null)
        .input("currentSalary", sql.Decimal(10, 2), currentSalary || 0)
        .input("additionalInfo", sql.NVarChar, additionalInfo || null)
        .query(`
          INSERT INTO CandidateProfessional (candidateId, experience, currentJobTitle, expectedSalary, skillSet, skypeID, highestQualification, currentEmployer, currentSalary, additionalInfo)
          VALUES (@candidateId, @experience, @currentJobTitle, @expectedSalary, @skillSet, @skypeID, @highestQualification, @currentEmployer, @currentSalary, @additionalInfo)
        `);

      // 🔹 Insert Social Links
      await transaction.request()
        .input("candidateId", sql.Int, candidateId)
        .input("linkedIn", sql.NVarChar, linkedIn || null)
        .input("twitter", sql.NVarChar, twitter || null)
        .input("facebook", sql.NVarChar, facebook || null)
        .query(`
          INSERT INTO CandidateSocial (candidateId, linkedIn, twitter, facebook)
          VALUES (@candidateId, @linkedIn, @twitter, @facebook)
        `);

      // 🔹 Insert Education Details
      if (Array.isArray(formattedEducation) && formattedEducation.length > 0) {
        for (let edu of formattedEducation) {
          await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .input("institute", sql.NVarChar, edu.institute)
            .input("major", sql.NVarChar, edu.major)
            .input("degree", sql.NVarChar, edu.degree)
            .input("startDate", sql.Date, edu.startDate || null)
            .input("endDate", sql.Date, edu.endDate || null)
            .query(`
              INSERT INTO Education (candidateId, institute, major, degree, start_date, end_date) 
              VALUES (@candidateId, @institute, @major, @degree, @startDate, @endDate)
            `);
        }
      }

      // 🔹 Insert File Uploads
      
      // ✅ Commit Transaction
      await transaction.commit();
      console.log("✅ Candidate Created Successfully:", candidateId);
      res.status(201).json({ message: "✅ Candidate created successfully!", candidateId });

    } catch (error) {
      await transaction.rollback();
      console.error("❌ Transaction Failed:", error.message);
      res.status(500).json({ error: "Database error", details: error.message });
    }

  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    res.status(500).json({ error: "Database connection error", details: error.message });
  }
};


exports.uploadFiles = async (req, res) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: "Candidate ID is required for file uploads" });
    }

    console.log("📂 Uploading files for Candidate ID:", candidateId);

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    for (const file of req.files) {
      await transaction.request()
        .input("candidateId", sql.Int, candidateId)
        .input("fileName", sql.NVarChar, file.originalname)
        .input("fileType", sql.NVarChar, file.mimetype)
        .input("filePath", sql.NVarChar, file.path)
        .query(`
          INSERT INTO CandidateFiles (candidateId, fileName, fileType, filePath)
          VALUES (@candidateId, @fileName, @fileType, @filePath)
        `);
    }

    await transaction.commit();
    res.status(200).json({ message: "✅ Files uploaded successfully!" });

  } catch (error) {
    console.error("❌ Error uploading files:", error);
    res.status(500).json({ error: "File upload error", details: error.message });
  }
};