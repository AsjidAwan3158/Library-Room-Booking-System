// require("dotenv").config();
// const mysql = require("mysql2/promise");

// (async () => {
//   try {
//     console.log("🔌 Testing database connection...");

//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST || "localhost",
//       user: process.env.DB_USER || "root",
//       password: process.env.DB_PASSWORD || "",
//       database: process.env.DB_NAME || "librarybookingsystem",
//     });

//     const [rows] = await connection.query("SELECT 1 + 1 AS result");

//     console.log("✅ Database connected successfully");
//     console.log("🧪 Test query result:", rows[0].result);

//     await connection.end();
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Database connection failed");
//     console.error(error.message);
//     process.exit(1);
//   }
// })();



const express = require("express");
const router = express.Router();
// const { pool } = require("../database");

router.get("/test-form", (req, res) => {
  console.log("📥 Form data received:", req.body);

  res.json({
    success: true,
    message: "Form data received successfully",
    data: req.body,
  });
});

module.exports = router;