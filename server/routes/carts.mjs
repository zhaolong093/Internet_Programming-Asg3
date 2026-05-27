import express from "express";
import { requireAuth } from "../middleware/auth.mjs";
import { Cart } from "../models/Cart.mjs";
import { Product } from "../models/Product.mjs";

export const cartRouter = express.Router();

function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

async function validatedItems(items) {
  if (!Array.isArray(items)) {
    throw new Error("Cart items must be an array.");
  }

  return Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.id);
      const qty = Number(item.qty);

      if (!product || !Number.isInteger(qty) || qty < 1) {
        throw new Error("Cart contains an invalid product or quantity.");
      }
      if (qty > product.stock) {
        throw new Error(`${product.name} does not have enough stock available.`);
      }

      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        qty,
      };
    }),
  );
}

cartRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const customerEmail = normalizeEmail(req.query.customerEmail);
    if (customerEmail) {
      if (req.user.role === "customer" && customerEmail !== req.user.email) {
        return res.status(403).json({ message: "You can only view your own cart." });
      }
      const cart = await Cart.findOne({ customerEmail });
      return res.json(cart ?? { customerEmail, items: [] });
    }

    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only administrators can view customer carts." });
    }
    const carts = await Cart.find({ "items.0": { $exists: true } }).sort({ updatedAt: -1 });
    res.json(carts);
  } catch (error) {
    next(error);
  }
});

cartRouter.put("/:customerEmail", requireAuth, async (req, res, next) => {
  try {
    const customerEmail = normalizeEmail(req.params.customerEmail);
    if (req.user.role === "customer" && customerEmail !== req.user.email) {
      return res.status(403).json({ message: "You can only update your own cart." });
    }
    const customerName =
      req.user.role === "customer" ? req.user.name : String(req.body.customerName ?? "").trim();

    if (!customerEmail || !customerName) {
      return res.status(400).json({ message: "Customer name and email are required." });
    }

    const items = await validatedItems(req.body.items);
    const cart = await Cart.findOneAndUpdate(
      { customerEmail },
      { customerName, customerEmail, items },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(cart);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Cart")) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof Error && error.message.includes("stock")) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
});

cartRouter.delete("/:customerEmail", requireAuth, async (req, res, next) => {
  try {
    const customerEmail = normalizeEmail(req.params.customerEmail);
    if (req.user.role === "customer" && customerEmail !== req.user.email) {
      return res.status(403).json({ message: "You can only clear your own cart." });
    }
    await Cart.findOneAndDelete({ customerEmail });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
