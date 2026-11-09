import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let memoryServer;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    // In production an in-memory database is worse than no database: the app
    // would accept writes and lose every record on restart. Fail loudly instead.
    if (process.env.NODE_ENV === "production") {
      console.error(
        `❌ MongoDB is unavailable in production (${error.message}). Refusing to start on an in-memory database.`,
      );
      return false;
    }

    console.warn(
      `⚠️  MongoDB connection failed (${error.message}). Starting in-memory fallback...`,
    );

    try {
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: "masterpools" },
      });

      const fallbackUri = memoryServer.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`In-memory MongoDB ready: ${conn.connection.host}`);
      return true;
    } catch (fallbackError) {
      console.error(
        "❌ In-memory MongoDB fallback failed:",
        fallbackError.message,
      );
      return false;
    }
  }
};

/**
 * Close the connection and stop the in-memory server.
 *
 * Without this, every `node --watch` restart leaves a mongod data directory
 * behind in /tmp. Those accumulate until the tmpfs fills up, after which mongod
 * aborts with an fassert() failure and the API starts with no database.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch {
    /* already closed */
  }

  if (memoryServer) {
    try {
      await memoryServer.stop({ doCleanup: true, force: true });
    } catch {
      /* best effort */
    }
    memoryServer = undefined;
  }
};
