import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./db.mjs";
import { cartRouter } from "./routes/carts.mjs";
import { orderRouter } from "./routes/orders.mjs";
import { productRouter } from "./routes/products.mjs";

const app = express();
const port = Number(process.env.API_PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:8080";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: "mongodb" });
});

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/orders", orderRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error. Please try again." });
});

await connectDatabase();

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
