const express = require("express");
const router = express.Router();
const { connectDB } = require("../config/database");

// -----------------------------
// CHECK USER BOOKINGS
// -----------------------------
router.get("/check-user", async (req, res) => {
  console.log("\n========================================");
  console.log("🔍 CHECK USER BOOKINGS REQUEST RECEIVED");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { studentId, date } = req.query;

  console.log("\n📦 Request Query:");
  console.log("  - Student ID:", studentId);
  console.log("  - Date:", date);

  try {
    console.log("\n🔌 Step 1: Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected successfully");

    console.log("\n📊 Step 2: Checking existing bookings...");
    const bookings = await db.all(
      `SELECT
        b.id,
        b.room_id,
        b.booking_date,
        b.requester_name,
        b.requester_student_id,
        b.status,
        b.queue_position,
        ts.start_time,
        ts.end_time
       FROM bookings b
       JOIN time_slots ts ON b.time_slot_id = ts.id
       WHERE b.requester_student_id = ?
         AND b.booking_date = ?`,
      [studentId, date]
    );

    console.log("✅ User bookings fetched successfully");
    console.log("  - Count:", bookings.length);
    console.log("  - Data:", JSON.stringify(bookings, null, 2));

    console.log("\n🎉 CHECK USER BOOKINGS COMPLETED SUCCESSFULLY");
    console.log("========================================\n");

    res.status(200).json({
      success: true,
      hasBookings: bookings.length > 0,
      bookings: bookings
    });
  } catch (err) {
    console.error("\n❌❌❌ CHECK USER BOOKINGS FAILED ❌❌❌");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.log("========================================\n");

    res.status(500).json({
      success: false,
      message: "Failed to check user bookings",
      error: err.message
    });
  }
});

// -----------------------------
// GET BOOKINGS BY DATE AND ROOM
// -----------------------------
router.get("/", async (req, res) => {
  console.log("\n========================================");
  console.log("📥 GET BOOKINGS REQUEST RECEIVED");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { date, room } = req.query;

  console.log("\n📦 Request Query:");
  console.log("  - Date:", date);
  console.log("  - Room:", room);

  try {
    console.log("\n🔌 Step 1: Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected successfully");

    let query = `
      SELECT
        b.id,
        b.room_id,
        b.booking_date,
        b.time_slot_id,
        b.requester_name,
        b.requester_student_id,
        b.status,
        b.queue_position,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.booking_date = ?
    `;

    let params = [date];

    if (room) {
      query += ` AND b.room_id = ?`;
      params.push(room);
    }

    query += ` ORDER BY ts.start_time ASC`;

    console.log("\n📊 Step 2: Fetching bookings from database...");
    console.log("  - Query:", query);
    console.log("  - Params:", params);

    const bookings = await db.all(query, params);

    console.log("✅ Bookings fetched successfully");
    console.log("  - Count:", bookings.length);
    console.log("  - Data:", JSON.stringify(bookings, null, 2));

    console.log("\n🎉 GET BOOKINGS COMPLETED SUCCESSFULLY");
    console.log("========================================\n");

    res.status(200).json({
      success: true,
      bookings: bookings
    });
  } catch (err) {
    console.error("\n❌❌❌ GET BOOKINGS FAILED ❌❌❌");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.log("========================================\n");

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: err.message
    });
  }
});

// -----------------------------
// CREATE BOOKING (MAIN FORM)
// -----------------------------
router.post("/", async (req, res) => {
  console.log("\n========================================");
  console.log("📝 NEW BOOKING REQUEST RECEIVED");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { room, date, time, applicant, members } = req.body;

  console.log("\n📦 Request Data:");
  console.log("  - Room:", room);
  console.log("  - Date:", date);
  console.log("  - Time:", time);
  console.log("  - Applicant:", JSON.stringify(applicant, null, 2));
  console.log("  - Members count:", members ? members.length : 0);
  if (members && members.length > 0) {
    console.log("  - Members:", JSON.stringify(members, null, 2));
  }

  let db;
  try {
    console.log("\n🔌 Step 1: Connecting to database...");
    db = await connectDB();
    console.log("✅ Database connected successfully");

    console.log("\n🔄 Step 2: Starting transaction...");
    await db.exec("BEGIN");
    console.log("✅ Transaction started");

    // 1️⃣ Get slot id
    console.log("\n⏰ Step 3: Processing time slot...");
    const startTime = time.split(" - ")[0];
    console.log("  - Extracted start time:", startTime);

    const slotRow = await db.get(
      "SELECT id FROM time_slots WHERE start_time = ?",
      [startTime]
    );

    console.log("  - Query result:", slotRow);

    if (!slotRow) {
      console.error("❌ ERROR: Time slot not found in database");
      console.error("  - Looking for start_time:", startTime);
      throw new Error(`Invalid time slot: ${startTime}`);
    }

    const slotId = slotRow.id;
    console.log("✅ Time slot found - ID:", slotId);

    // 2️⃣ Calculate queue position
    console.log("\n📊 Step 4: Calculating queue position...");
    console.log("  - Parameters:", { room, slotId, date });

    const countRow = await db.get(
      `SELECT COUNT(*) AS total
       FROM bookings
       WHERE room_id = ?
         AND time_slot_id = ?
         AND booking_date = ?`,
      [room, slotId, date]
    );

    console.log("  - Current bookings count:", countRow.total);

    const queuePosition = countRow.total + 1;
    console.log("✅ Queue position calculated:", queuePosition);

    // 3️⃣ Insert booking
    console.log("\n💾 Step 5: Inserting booking into database...");
    const bookingData = [
      room,
      date,
      slotId,
      applicant.name,
      applicant.id,
      applicant.email,
      applicant.phone,
      queuePosition,
    ];
    console.log("  - Booking data:", bookingData);

    const bookingResult = await db.run(
      `INSERT INTO bookings (
        room_id,
        booking_date,
        time_slot_id,
        requester_name,
        requester_student_id,
        requester_email,
        requester_phone,
        status,
        queue_position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      bookingData
    );

    const bookingId = bookingResult.lastID;
    console.log("✅ Booking inserted successfully");
    console.log("  - Booking ID:", bookingId);

    // 4️⃣ Insert group members
    console.log("\n👥 Step 6: Inserting group members...");
    if (!members || members.length === 0) {
      console.log("  - No members to insert");
    } else {
      for (const member of members) {
        console.log("  - Inserting member:", member);
        await db.run(
          `INSERT INTO booking_members
           (booking_id, member_name, member_student_id)
           VALUES (?, ?, ?)`,
          [bookingId, member.name, member.id]
        );
      }
      console.log("✅ All members inserted successfully");
    }

    // 5️⃣ Commit transaction
    console.log("\n💾 Step 7: Committing transaction...");
    await db.exec("COMMIT");
    console.log("✅ Transaction committed successfully");

    console.log("\n🎉 BOOKING COMPLETED SUCCESSFULLY");
    console.log("========================================\n");

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully",
      queuePosition,
    });
  } catch (err) {
    console.error("\n❌❌❌ BOOKING FAILED ❌❌❌");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    if (db) {
      console.log("\n🔄 Rolling back transaction...");
      try {
        await db.exec("ROLLBACK");
        console.log("✅ Transaction rolled back");
      } catch (rollbackErr) {
        console.error("❌ Rollback failed:", rollbackErr.message);
      }
    }

    console.log("\n📤 Sending error response to client...");
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
    console.log("========================================\n");
  }
});

// -----------------------------
// TEST ROUTE (DEBUG ONLY)
// -----------------------------
router.post("/test-form", (req, res) => {
  console.log("\n🧪 TEST FORM ROUTE CALLED");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
  console.log("========================================\n");

  res.json({
    success: true,
    message: "Form data received successfully",
    data: req.body,
  });
});



// -----------------------------
// ADMIN: UPDATE BOOKING STATUS
// -----------------------------
router.put("/admin/:id/status", async (req, res) => {
  console.log("\n========================================");
  console.log("🔄 ADMIN: UPDATE BOOKING STATUS REQUEST");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { id } = req.params;
  const { status } = req.body;

  console.log("\n📦 Request Params:");
  console.log("  - Booking ID:", id);
  console.log("📦 Request Body:");
  console.log("  - New Status:", status);

  try {
    console.log("\n🔌 Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected");

    console.log("\n🔄 Starting transaction...");
    await db.exec("BEGIN");

    // Update booking status
    const result = await db.run(
      `UPDATE bookings
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.changes === 0) {
      await db.exec("ROLLBACK");
      console.log("❌ Booking not found or no changes made");
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    console.log("✅ Booking status updated:", id, "->", status);

    await db.exec("COMMIT");
    console.log("✅ Transaction committed");

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      bookingId: id,
      newStatus: status
    });
  } catch (err) {
    console.error("\n❌❌❌ ADMIN UPDATE STATUS FAILED ❌❌❌");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    try {
      await db.exec("ROLLBACK");
      console.log("✅ Transaction rolled back");
    } catch (rollbackErr) {
      console.error("❌ Rollback failed:", rollbackErr.message);
    }

    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: err.message
    });
  }
});

// -----------------------------
// ADMIN: DELETE BOOKING
// -----------------------------
router.delete("/admin/:id", async (req, res) => {
  console.log("\n========================================");
  console.log("🗑️ ADMIN: DELETE BOOKING REQUEST");
  console.log("========================================");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const { id } = req.params;

  console.log("\n📦 Request Params:");
  console.log("  - Booking ID:", id);

  try {
    console.log("\n🔌 Connecting to database...");
    const db = await connectDB();
    console.log("✅ Database connected");

    console.log("\n🔄 Starting transaction...");
    await db.exec("BEGIN");

    // Delete members first (foreign key constraint)
    await db.run(
      `DELETE FROM booking_members WHERE booking_id = ?`,
      [id]
    );
    console.log("✅ Members deleted");

    // Delete booking
    const result = await db.run(
      `DELETE FROM bookings WHERE id = ?`,
      [id]
    );

    if (result.changes === 0) {
      await db.exec("ROLLBACK");
      console.log("❌ Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    console.log("✅ Booking deleted:", id);

    await db.exec("COMMIT");
    console.log("✅ Transaction committed");

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      bookingId: id
    });
  } catch (err) {
    console.error("\n❌❌❌ ADMIN DELETE BOOKING FAILED ❌❌❌");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    try {
      await db.exec("ROLLBACK");
      console.log("✅ Transaction rolled back");
    } catch (rollbackErr) {
      console.error("❌ Rollback failed:", rollbackErr.message);
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: err.message
    });
  }
});

module.exports = router;
