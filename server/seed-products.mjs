import "dotenv/config";
import { connectDatabase } from "./db.mjs";
import { Product } from "./models/Product.mjs";

const products = [
  {
    name: "Aurora Wool Coat",
    sku: "AWC-1042",
    category: "Apparel",
    price: 289,
    stock: 42,
    description: "Premium merino wool coat.",
  },
  {
    name: "Drift Runner Sneakers",
    sku: "DRN-220",
    category: "Footwear",
    price: 149,
    stock: 88,
    description: "Lightweight daily trainer.",
  },
  {
    name: "Heron Wireless Earbuds",
    sku: "HWE-540",
    category: "Electronics",
    price: 199,
    stock: 55,
    description: "Active noise cancellation.",
  },
  {
    name: "Pulse Smart Watch",
    sku: "PSW-712",
    category: "Electronics",
    price: 329,
    stock: 30,
    description: "Health tracking and notifications.",
  },
  {
    name: "Atlas Carry-On 35L",
    sku: "ATC-091",
    category: "Luggage",
    price: 245,
    stock: 17,
    description: "TSA-approved hardshell carry-on.",
  },
];

await connectDatabase();
await Promise.all(
  products.map(({ sku, ...product }) =>
    Product.findOneAndUpdate({ sku }, { sku, ...product }, { upsert: true, new: true }),
  ),
);
console.log(`Seeded or updated ${products.length} products.`);
await Product.db.close();
