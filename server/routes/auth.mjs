import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.mjs";

export const authRouter = Router();

// Register — hashes password, saves customer to MongoDB
authRouter.post("/register", async (req, res) => {
  try {
    const { id, name, email, role, initials, password } = req.body;
    if (!email) { res.status(400).json({ message: "Email required." }); return; }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) { res.status(409).json({ message: "Email already registered." }); return; }

    const passwordHash = password
      ? await bcrypt.hash(password, 12)
      : null;

    const user = await User.create({
      id,
      name,
      email: email.toLowerCase(),
      role:  role ?? "customer",
      initials,
      passwordHash,
    });

    res.status(201).json({
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        initials: user.initials,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login — verifies password hash
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) { res.status(400).json({ message: "Email required." }); return; }

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) { res.status(404).json({ message: "No account found with that email." }); return; }

    // Only check password if the account has one set
    if (user.passwordHash && password) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) { res.status(401).json({ message: "Incorrect password." }); return; }
    }

    res.json({
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        initials: user.initials,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});