const { sql, poolPromise } = require("../../config/db");

// ✅ Create Job Template
exports.createJobTemplate = async (req, res) => {
  try {
    const { templateName, industry, storeUnder,clientName, contactName, skills, experience, salary, jobDescription, requirements, benefits } = req.body;

    if ( !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!Array.isArray(skills)) {
        console.error("Invalid skills format:", skills);
        return res.status(400).json({ error: "Skills must be an array" });
      }
  
    const pool = await poolPromise;

    // Insert Job Template
    const result = await pool
      .request()
      .input("templateName", sql.NVarChar, templateName)
      .input("industry", sql.NVarChar, industry)
      .input("storeUnder", sql.NVarChar, storeUnder)
      .input("clientName", sql.NVarChar, clientName)
      .input("contactName", sql.NVarChar, contactName)
      .input("experience", sql.NVarChar, experience || null)
      .input("salary", sql.NVarChar, salary || null)
      .input("jobDescription", sql.Text, jobDescription)
      .input("requirements", sql.Text, requirements || null)
      .input("benefits", sql.Text, benefits || null)
      .query(`
        INSERT INTO JobTemplates (templateName, industry,storeUnder, clientName, contactName, experience, salary, jobDescription, requirements, benefits)
        OUTPUT INSERTED.id
        VALUES (@templateName, @industry,@storeUnder, @clientName, @contactName, @experience, @salary, @jobDescription, @requirements, @benefits);
      `);

    const jobTemplateId = result.recordset[0].id;

    // Insert Skills (if provided)
    if (Array.isArray(skills) && skills.length > 0) {
      const skillInsertPromises = skills.map(skill => {
        return pool.request()
          .input("jobTemplateId", sql.Int, jobTemplateId)
          .input("skillName", sql.NVarChar, skill)
          .query(`
            INSERT INTO JobTemplateSkills (jobTemplateId, skillName)
            VALUES (@jobTemplateId, @skillName);
          `);
      });
      await Promise.all(skillInsertPromises);
    }

    res.status(201).json({ message: "Job template created successfully", jobTemplateId });
  } catch (error) {
    console.error("Error creating job template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Job Templates
// exports.getJobTemplates = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//       SELECT jt.*, 
//         ISNULL(STRING_AGG(js.skillName, ', '), '') AS skills
//       FROM JobTemplates jt
//       LEFT JOIN JobTemplateSkills js ON jt.id = js.jobTemplateId
//       GROUP BY jt.id, jt.templateName, jt.industry, jt.clientName, jt.contactName, jt.experience, jt.salary, jt.jobDescription, jt.requirements, jt.benefits
//       ORDER BY jt.id DESC;
//     `);

//     res.json(result.recordset);
//   } catch (error) {
//     console.error("Error fetching job templates:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getJobTemplates = async (req, res) => {
  try {
    const pool = await poolPromise;
    console.log("Fetching job templates..."); // Debugging log
    const result = await pool.request().query(`
      SELECT jt.*, 
        ISNULL(STRING_AGG(js.skillName, ', '), '') AS skills
      FROM JobTemplates jt
      LEFT JOIN JobTemplateSkills js ON jt.id = js.jobTemplateId
      GROUP BY jt.id, jt.templateName, jt.industry, jt.storeUnder, jt.clientName, jt.contactName, jt.experience, jt.salary, jt.jobDescription, jt.requirements, jt.benefits
      ORDER BY jt.id DESC;
    `);

    // ✅ Convert skills from string to array before sending response
    const jobTemplates = result.recordset.map(job => ({
      ...job,
      skills: job.skills ? job.skills.split(', ') : [] 
    }));

    res.json(jobTemplates);
  } catch (error) {
    console.error("Error fetching job templates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get a Single Job Template by ID
exports.getJobTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
 
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
         SELECT 
    jt.id, 
    jt.templateName, 
    jt.industry, 
    jt.storeUnder, 
    jt.clientName, 
    jt.contactName, 
    jt.experience, 
    jt.salary, 
    CAST(jt.jobDescription AS NVARCHAR(MAX)) AS jobDescription, 
    CAST(jt.requirements AS NVARCHAR(MAX)) AS requirements, 
    CAST(jt.benefits AS NVARCHAR(MAX)) AS benefits,
    ISNULL(STRING_AGG(js.skillName, ', '), '') AS skills
  FROM JobTemplates jt
  LEFT JOIN JobTemplateSkills js ON jt.id = js.jobTemplateId
  GROUP BY 
    jt.id, 
    jt.templateName, 
    jt.industry, 
    jt.storeUnder, 
    jt.clientName, 
    jt.contactName, 
    jt.experience, 
    jt.salary, 
    CAST(jt.jobDescription AS NVARCHAR(MAX)), 
    CAST(jt.requirements AS NVARCHAR(MAX)), 
    CAST(jt.benefits AS NVARCHAR(MAX))
  ORDER BY jt.id DESC;
`);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Job template not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching job template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
           
// ✅ Delete Job Template (with Check)
exports.deleteJobTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Check if Job Template exists
    const checkTemplate = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT id FROM JobTemplates WHERE id = @id`);

    if (checkTemplate.recordset.length === 0) {
      return res.status(404).json({ error: "Job template not found" });
    }

    // Delete Skills first, then Job Template
    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM JobTemplateSkills WHERE jobTemplateId = @id;
      DELETE FROM JobTemplates WHERE id = @id;
    `);

    res.json({ message: "Job template deleted successfully" });
  } catch (error) {
    console.error("Error deleting job template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
