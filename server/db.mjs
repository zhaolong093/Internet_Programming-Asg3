import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/lreturns";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
