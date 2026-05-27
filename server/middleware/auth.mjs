import jwt from "jsonwebtoken";

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in the environment.");
  }
  return process.env.JWT_SECRET;
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    jwtSecret(),
    { expiresIn: "8h" },
  );
}

export function requireAuth(req, res, next) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret());
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    next();
  };
}
