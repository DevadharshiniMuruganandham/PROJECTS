const { sql, poolPromise } = require("../../config/db"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required!" });
    }

    const pool = await poolPromise;

    // Optimized query: Fetch only necessary fields & avoid LOWER() for index usage
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username.toLowerCase()) // Ensure usernames are stored in lowercase
      .query("SELECT id, username, password FROM userinfo WHERE username = @username");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Secure password comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token with a secure expiry time
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Extend token expiry if needed
    );

    res.status(200).json({ message: "Login successful!", token, user: { id: user.id, username: user.username } });

  } catch (err) {
    console.error("❌ Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
