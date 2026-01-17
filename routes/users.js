const express = require("express");
const router = express.Router();
const { pool } = require("../database");

// Get user by ID
router.get("/:userId", async (req, res) => {
  res.json({ ok: true });
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      "SELECT user_id, name, email, phone, role, student_id FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

// Create new user
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role, student_id, password_hash } = req.body;

    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, role, student_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, role, student_id, password_hash]
    );

    res.status(201).json({
      success: true,
      user_id: result.insertId,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

module.exports = router;
