const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

async function connectDB() {
  if (!db) {
    db = await open({
      filename:
        "./database/librarybookingsystem.db",
      driver: sqlite3.Database,
    });

    // VERY IMPORTANT: enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON");

    console.log("✅ SQLite database connected");
  }

  return db;
}

// Optional test function (matches your old pattern)
const testConnection = async () => {
  try {
    const database = await connectDB();
    await database.get("SELECT 1");
    console.log("✅ SQLite test query successful");
  } catch (error) {
    console.error("❌ SQLite connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, testConnection };
