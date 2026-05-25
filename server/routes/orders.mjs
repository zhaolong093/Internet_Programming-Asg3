import express from "express";
import { Cart } from "../models/Cart.mjs";
import { Order } from "../models/Order.mjs";
import { Product } from "../models/Product.mjs";

export const orderRouter = express.Router();

const statuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

function orderNumber() {
  return `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function addressPayload(body) {
  return {
    fullName: String(body.fullName ?? "").trim(),
    line1: String(body.line1 ?? "").trim(),
    city: String(body.city ?? "").trim(),
    state: String(body.state ?? "").trim(),
    postcode: String(body.postcode ?? "").trim(),
    country: String(body.country ?? "").trim(),
  };
}

orderRouter.get("/", async (_req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

orderRouter.post("/", async (req, res, next) => {
  try {
    const customerName = String(req.body.customerName ?? "").trim();
    const customerEmail = String(req.body.customerEmail ?? "")
      .trim()
      .toLowerCase();
    const address = addressPayload(req.body.address ?? {});
    const requestItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (!customerName || !customerEmail || requestItems.length === 0) {
      return res.status(400).json({ message: "Customer and cart details are required." });
    }
    if (Object.values(address).some((value) => !value)) {
      return res.status(400).json({ message: "Delivery address is incomplete." });
    }

    const items = [];
    for (const requested of requestItems) {
      const product = await Product.findById(requested.id);
      const qty = Number(requested.qty);
      if (!product || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "Order contains an invalid item." });
      }
      if (product.stock < qty) {
        return res.status(409).json({ message: `${product.name} does not have enough stock.` });
      }
      items.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        qty,
        price: product.price,
      });
    }

    const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order = await Order.create({
      orderNumber: orderNumber(),
      customerName,
      customerEmail,
      items,
      subtotal,
      tax,
      total,
      address,
    });

    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } }),
      ),
    );
    await Cart.findOneAndDelete({ customerEmail });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

orderRouter.patch("/:orderNumber", async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status !== undefined) {
      if (!statuses.has(req.body.status)) {
        return res.status(400).json({ message: "Invalid order status." });
      }
      update.status = req.body.status;
    }
    if (req.body.adminNote !== undefined) {
      update.adminNote = String(req.body.adminNote).trim();
    }
    const order = await Order.findOneAndUpdate({ orderNumber: req.params.orderNumber }, update, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

orderRouter.delete("/:orderNumber", async (req, res, next) => {
  try {
    const order = await Order.findOneAndDelete({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
