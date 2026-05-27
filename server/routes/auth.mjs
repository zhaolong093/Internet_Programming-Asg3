import { randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/auth.mjs";
import { User } from "../models/User.mjs";

export const authRouter = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    initials: user.initials,
  };
}

function initialsFor(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password ?? "");

    if (!name || !email || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Name, email and an 8 character password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({
      id: `u-${randomUUID()}`,
      name,
      email,
      role: "customer",
      initials: initialsFor(name),
      passwordHash: await bcrypt.hash(password, 12),
    });

    res.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
});
