const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

console.log("🔥 server.js file is being executed");

const { testConnection } = require("./config/database");

// Import routes (each maps to DB tables)
const bookingRoutes = require("./routes/bookings");
// const roomRoutes = require("./routes/rooms");
const adminRoutes = require("./routes/admin");
// const userRoutes = require("./routes/users");
const testRoutes = require("./routes/testdb");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   GLOBAL MIDDLEWARE
   ======================= */

// Security headers
app.use(helmet());

// Allow frontend access
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);

// Request logging
app.use(morgan("dev"));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   ROUTES
   ======================= */

// Booking-related DB operations
app.use("/api/bookings", bookingRoutes);

// // Rooms & time slots
// app.use("/api/rooms", roomRoutes);

// // Admin operations (queue, confirm, cancel)
app.use("/api/admin", adminRoutes);

// // Users / booking applicants
// app.use("/api/users", userRoutes);
app.use("/api/testdb", testRoutes);

/* =======================
   SYSTEM ROUTES
   ======================= */

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* =======================
   ERROR HANDLING
   ======================= */

// 404 – no route matched
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* =======================
   SERVER START
   ======================= */

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
});
