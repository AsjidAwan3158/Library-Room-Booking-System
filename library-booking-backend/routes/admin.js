const express = require("express");
const router = express.Router();
const { connectDB } = require("../config/database");

// -----------------------------
// ADMIN: GET ALL BOOKINGS
// -----------------------------
router.get("/all", async (req, res) => {
  console.log("\n========================================");
  console.log("📊 ADMIN: GET ALL BOOKINGS REQUEST");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  try {
    console.log("\n🔌 Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected");

    const bookings = await db.all(`
      SELECT
        b.id,
        b.room_id,
        b.booking_date,
        b.time_slot_id,
        b.requester_name,
        b.requester_student_id,
        b.requester_email,
        b.requester_phone,
        b.status,
        b.queue_position,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN time_slots ts ON b.time_slot_id = ts.id
      ORDER BY b.booking_date DESC, ts.start_time ASC
    `);

    console.log("✅ All bookings fetched");
    console.log("  - Count:", bookings.length);

    res.status(200).json({
      success: true,
      bookings: bookings
    });
  } catch (err) {
    console.error("\n❌❌❌ ADMIN GET ALL BOOKINGS FAILED ❌❌❌");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all bookings",
      error: err.message
    });
  }
});


// -----------------------------
// ADMIN: GET BOOKING DETAILS
// -----------------------------
router.get("/:id", async (req, res) => {
  console.log("\n========================================");
  console.log("📋 ADMIN: GET BOOKING DETAILS REQUEST");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { id } = req.params;
  console.log("\n📦 Request Params:");
  console.log("  - Booking ID:", id);

  try {
    console.log("\n🔌 Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected");

    // Get booking details
    const booking = await db.get(`
      SELECT
        b.id,
        b.room_id,
        b.booking_date,
        b.time_slot_id,
        b.requester_name,
        b.requester_student_id,
        b.requester_email,
        b.requester_phone,
        b.status,
        b.queue_position,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.id = ?
    `, [id]);

    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    console.log("✅ Booking fetched:", booking.id);

    // Get members
    const members = await db.all(`
      SELECT
        id,
        member_name,
        member_student_id
      FROM booking_members
      WHERE booking_id = ?
    `, [id]);

    console.log("✅ Members fetched:", members.length);

    res.status(200).json({
      success: true,
      booking: booking,
      members: members
    });
  } catch (err) {
    console.error("\n❌❌❌ ADMIN GET BOOKING DETAILS FAILED ❌❌❌");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
      error: err.message
    });
  }
});
module.exports = router;