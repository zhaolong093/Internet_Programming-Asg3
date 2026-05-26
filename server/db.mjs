import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/lreturns";
const DEFAULT_DATABASE = "lreturns";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = process.env.MONGODB_DB_NAME || DEFAULT_DATABASE;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName });
  return mongoose.connection;
}
