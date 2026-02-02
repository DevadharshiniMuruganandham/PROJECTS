const { sql, poolPromise } = require("../config/db");

exports.createCandidate = async (candidateData, files =[]) => {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try {
        const {
            email, phone, firstName, lastName, website, mobile, street, city, country, postalCode, province,
            experience, currentJobTitle, expectedSalary, skillSet, skypeID, highestQualification,
            currentEmployer, currentSalary, additionalInfo, linkedIn, twitter, facebook,
            Education=[], Experience=[]
        } = candidateData;
        
        // Insert candidate details
        const candidateResult = await transaction.request()
            .input("email", sql.NVarChar, email)
            .input("phone", sql.NVarChar, phone)
            .input("firstName", sql.NVarChar, firstName)
            .input("lastName", sql.NVarChar, lastName)
            .input("website", sql.NVarChar, website)
            .input("mobile", sql.NVarChar, mobile)
            .query(`
                INSERT INTO Candidates (email, phone, firstName, lastName, website, mobile) 
                OUTPUT INSERTED.candidateId 
                VALUES (@email, @phone, @firstName, @lastName, @website, @mobile)
            `);

        const candidateId = candidateResult.recordset[0].candidateId;

        // Insert candidate address
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .input("street", sql.NVarChar, street)
            .input("city", sql.NVarChar, city)
            .input("country", sql.NVarChar, country)
            .input("postalCode", sql.NVarChar, postalCode)
            .input("province", sql.NVarChar, province)
            .query(`
                INSERT INTO CandidateAddress (candidateId, street, city, country, postalCode, province) 
                VALUES (@candidateId, @street, @city, @country, @postalCode, @province)
            `);
        
        // Insert professional details
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .input("experience", sql.Int, experience)
            .input("currentJobTitle", sql.NVarChar, currentJobTitle)
            .input("expectedSalary", sql.Decimal(10,2), expectedSalary)
            .input("skillSet", sql.NVarChar, skillSet)
            .input("skypeID", sql.NVarChar, skypeID)
            .input("highestQualification", sql.NVarChar, highestQualification)
            .input("currentEmployer", sql.NVarChar, currentEmployer)
            .input("currentSalary", sql.Decimal(10,2), currentSalary)
            .input("additionalInfo", sql.NVarChar, additionalInfo)
            .query(`
                INSERT INTO CandidateProfessional (candidateId, experience, currentJobTitle, expectedSalary, skillSet, skypeID, highestQualification, currentEmployer, currentSalary, additionalInfo) 
                VALUES (@candidateId, @experience, @currentJobTitle, @expectedSalary, @skillSet, @skypeID, @highestQualification, @currentEmployer, @currentSalary, @additionalInfo)
            `);
        
        // Insert social links
        await transaction.request()
            .input("candidateId", sql.Int, candidateId)
            .input("linkedIn", sql.NVarChar, linkedIn)
            .input("twitter", sql.NVarChar, twitter)
            .input("facebook", sql.NVarChar, facebook)
            .query(`
                INSERT INTO CandidateSocial (candidateId, linkedIn, twitter, facebook) 
                VALUES (@candidateId, @linkedIn, @twitter, @facebook)
            `);

        // Insert candidate education
        if (Array.isArray(Education)) {
            for (let { institute, major, degree, startDate, endDate } of Education) {
                await transaction.request()
                    .input("candidateId", sql.Int, candidateId)
                    .input("institute", sql.NVarChar, institute)
                    .input("major", sql.NVarChar, major)
                    .input("degree", sql.NVarChar, degree)
                    .input("startDate", sql.Date, startDate)
                    .input("endDate", sql.Date, endDate)
                    .query(`
                        INSERT INTO Education (candidateId, institute, major, degree, start_date, end_date) 
                        VALUES (@candidateId, @institute, @major, @degree, @startDate, @endDate)
                    `);
            }
        }

        // Insert candidate work experience
        if (Array.isArray(Experience)) {
            for (let { role, company, year } of Experience) {
                await transaction.request()
                    .input("candidateId", sql.Int, candidateId)
                    .input("role", sql.NVarChar, role)
                    .input("company", sql.NVarChar, company)
                    .input("year", sql.Int, year)
                    .query(`
                        INSERT INTO Experience (candidateId, role, company, year) 
                        VALUES (@candidateId, @role, @company, @year)
                    `);
            }
        }

        // Insert candidate files if provided
        if (Array.isArray(files) && files.length > 0) {
            for (let file of files) {
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
        }

        // Commit transaction
        await transaction.commit();
        return { candidateId };
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating candidate:", error);
        throw new Error("Database transaction failed: " + error.message);
    }
};
