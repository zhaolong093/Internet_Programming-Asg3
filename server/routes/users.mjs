import { Router } from "express";
import { User } from "../models/User.mjs";

export const userRouter = Router();

// Get all users (admin customer list)
userRouter.get("/", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json(users);
});

// Update user (name, email, role)
userRouter.patch("/:id", async (req, res) => {
  const user = await User.findOneAndUpdate(
    { id: req.params.id },
    { $set: req.body },
    { new: true }
  ).lean();
  if (!user) { res.status(404).json({ message: "User not found." }); return; }
  res.json(user);
});