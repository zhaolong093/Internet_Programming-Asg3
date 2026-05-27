import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.mjs";
import { User } from "../models/User.mjs";

export const userRouter = Router();

const publicFields = "id name email role initials createdAt updatedAt";

userRouter.get("/", requireAuth, requireRole("admin", "staff"), async (_req, res, next) => {
  try {
    const users = await User.find().select(publicFields).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const isAdmin = ["admin", "staff"].includes(req.user.role);
    if (!isAdmin && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You can only update your own profile." });
    }

    const update = {
      name: String(req.body.name ?? "").trim(),
      email: String(req.body.email ?? "")
        .trim()
        .toLowerCase(),
    };
    if (!update.name || !update.email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    if (isAdmin && ["admin", "staff", "customer"].includes(req.body.role)) {
      update.role = req.body.role;
    }

    const user = await User.findOneAndUpdate({ id: req.params.id }, update, {
      new: true,
      runValidators: true,
    }).select(publicFields);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});
