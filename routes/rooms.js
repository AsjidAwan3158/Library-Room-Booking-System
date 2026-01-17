const express = require("express");
const router = express.Router();
const { pool } = require("../database");

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM rooms WHERE status = "Available" ORDER BY room_id'
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
});

// Get room availability for specific date
router.get("/availability", async (req, res) => {
  try {
    const { room_id, booking_date } = req.query;

    // Get all time slots
    const timeSlots = [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "12:00 PM - 01:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM",
    ];

    const availability = [];

    for (const slot of timeSlots) {
      // Check if slot is booked
      const [rows] = await pool.query(
        "SELECT status, COUNT(*) as count FROM bookings WHERE room_id = ? AND booking_date = ? AND time_slot = ? GROUP BY status",
        [room_id, booking_date, slot]
      );

      const statusCounts = {};
      rows.forEach((row) => {
        statusCounts[row.status] = row.count;
      });

      let status = "available";
      let displayStatus = "Available";
      let icon = "🟢";

      if (statusCounts["Confirmed"]) {
        status = "confirmed";
        displayStatus = "Confirmed";
        icon = "🔴";
      } else if (statusCounts["Pending"]) {
        status = "pending";
        displayStatus = "Pending";
        icon = "🟡";
      }

      availability.push({
        time_slot: slot,
        status: status,
        display_status: displayStatus,
        icon: icon,
        request_count: statusCounts["Pending"] || 0,
      });
    }

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching availability",
      error: error.message,
    });
  }
});

module.exports = router;
