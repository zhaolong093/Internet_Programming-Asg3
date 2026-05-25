import express from "express";
import { Product } from "../models/Product.mjs";

export const productRouter = express.Router();

function productPayload(body) {
  return {
    name: String(body.name ?? "").trim(),
    sku: String(body.sku ?? "")
      .trim()
      .toUpperCase(),
    category: String(body.category ?? "").trim(),
    price: Number(body.price),
    stock: Number(body.stock),
    description: String(body.description ?? "").trim(),
  };
}

function validateProduct(payload) {
  const errors = {};

  if (!payload.name) errors.name = "Product name is required.";
  if (!payload.sku) errors.sku = "SKU is required.";
  if (!payload.category) errors.category = "Category is required.";
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    errors.price = "Price must be greater than 0.";
  }
  if (!Number.isInteger(payload.stock) || payload.stock < 0) {
    errors.stock = "Stock must be a non-negative whole number.";
  }

  return errors;
}

productRouter.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", async (req, res, next) => {
  try {
    const payload = productPayload(req.body);
    const errors = validateProduct(payload);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Invalid product.", errors });
    }

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU already exists." });
    }
    next(error);
  }
});

productRouter.put("/:id", async (req, res, next) => {
  try {
    const payload = productPayload(req.body);
    const errors = validateProduct(payload);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Invalid product.", errors });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU already exists." });
    }
    next(error);
  }
});

productRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
