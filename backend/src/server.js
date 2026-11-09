import "dotenv/config";

import http from "http";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import {
  seedAdmin,
  seedBlogPost,
  seedProducts,
  seedProjects,
} from "./utils/seed.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(async (connected) => {
  if (connected) {
    await seedAdmin();
    await seedBlogPost();
    await seedProjects();
    await seedProducts();
  }

  server.listen(PORT, () => {
    console.log(`MasterPools API running on port ${PORT}`);
    if (!connected) {
      console.warn(
        "⚠️  Server is running without a MongoDB connection. Database-backed features will not work until MongoDB is available.",
      );
    }
  });
});

/**
 * Release the database cleanly. `node --watch` restarts the process on every
 * save; if the in-memory server is not stopped each time, its /tmp data
 * directory is orphaned and eventually exhausts the tmpfs.
 */
let shuttingDown = false;
const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n${signal} received — closing database`);

  const done = async () => {
    await disconnectDB();
    process.exit(0);
  };

  const timer = setTimeout(done, 5000);
  server.close(() => {
    clearTimeout(timer);
    done();
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
