// ============================================
// server.js - Entry Point
// ============================================

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Explicitly resolve .env path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, ".env") });

import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";
import seedAdminUser from "./src/config/seedAdmin.js";


const PORT = process.env.PORT || 5000;

// Using async/await pattern (JS Essentials: Async/Await)
const startServer = async () => {
  try {
    await connectDB(); // MongoDB connection (MongoDB: Database Connection)
    await seedAdminUser(); // Seed/verify admin account (sanketbhende0@gmail.com)

    app.listen(PORT, () => { // Start Express server (Node.js: Server Setup)
      console.log(`\n Server is running on port ${PORT}`); // Template literal (JS Essentials: Template Literals)
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` URL: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
