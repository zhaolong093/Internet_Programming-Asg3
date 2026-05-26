import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  role:         { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
  initials:     { type: String, required: true },
  passwordHash: { type: String, default: null }, // null = no password (OAuth / mock)
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);