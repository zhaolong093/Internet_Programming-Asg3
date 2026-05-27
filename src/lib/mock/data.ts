import type {
  ActivityEvent,
  AppNotification,
  Customer,
  ReturnItem,
  ReturnReason,
  ReturnStatus,
} from "./types";

const reasons: ReturnReason[] = ["Wrong Item", "Damaged", "Changed Mind", "Quality Issue", "Other"];
const statuses: ReturnStatus[] = ["pending", "approved", "rejected", "processing", "refunded"];

const firstNames = [
  "Olivia",
  "Liam",
  "Emma",
  "Noah",
  "Sophia",
  "Mason",
  "Ava",
  "Lucas",
  "Mia",
  "Ethan",
  "Isabella",
  "Aiden",
  "Amelia",
  "Logan",
  "Harper",
  "Jacob",
  "Evelyn",
  "Michael",
  "Abigail",
  "Daniel",
];
const lastNames = [
  "Carter",
  "Bennett",
  "Hughes",
  "Foster",
  "Nguyen",
  "Patel",
  "García",
  "Khan",
  "Reyes",
  "Walker",
  "Brooks",
  "Murphy",
  "Coleman",
  "Hayes",
  "Sullivan",
  "Pierce",
  "Romero",
  "Jenkins",
  "Holland",
  "Diaz",
];
const products = [
  { name: "Aurora Wool Coat", sku: "AWC-1042", variant: "Size: L, Color: Navy", price: 289 },
  { name: "Drift Runner Sneakers", sku: "DRN-220", variant: "Size: 10, Color: White", price: 149 },
  { name: "Heron Wireless Earbuds", sku: "HWE-540", variant: "Color: Graphite", price: 199 },
  { name: "Linen Lounge Shirt", sku: "LLS-018", variant: "Size: M, Color: Sand", price: 79 },
  { name: "Atlas Carry-On 35L", sku: "ATC-091", variant: "Color: Olive", price: 245 },
  { name: "Glow Ceramic Mug Set", sku: "GCM-004", variant: "Set of 4", price: 48 },
  { name: "Pulse Smart Watch", sku: "PSW-712", variant: "Color: Silver", price: 329 },
  { name: "Nimbus Down Pillow", sku: "NDP-220", variant: "Standard", price: 65 },
  { name: "Riverbend Denim Jacket", sku: "RDJ-503", variant: "Size: M, Indigo", price: 138 },
  { name: "Volt Pro Mechanical Keyboard", sku: "VPM-880", variant: "Tactile Brown", price: 179 },
];
const explanations = [
  "The item arrived with a tear on the seam.",
  "Wrong size shipped — ordered Medium, received Small.",
  "Color looks very different from the website photos.",
  "Stopped working after two days of use.",
  "Decided I no longer need it.",
  "Quality is far below what I expected for the price.",
  "Box was damaged in shipping and the product is dented.",
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seedRandom(42);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

function daysAgo(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

function minsAgo(m: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

export const customers: Customer[] = Array.from({ length: 36 }).map((_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 3) % lastNames.length];
  const orders = 2 + Math.floor(rand() * 28);
  const returns = Math.floor(rand() * 6);
  const flagged = returns >= 4;
  return {
    id: `CUS-${(1000 + i).toString()}`,
    name: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    phone: `+1 (555) ${100 + i}-${(2000 + i * 7).toString().slice(-4)}`,
    totalOrders: orders,
    totalReturns: returns,
    returnRate: Math.round((returns / orders) * 100),
    ltv: Math.round(orders * (80 + rand() * 240) * 100) / 100,
    status: flagged ? "Flagged" : i % 17 === 0 ? "Blocked" : "Active",
    lastActivity: daysAgo(Math.floor(rand() * 40)),
    customerSince: daysAgo(120 + Math.floor(rand() * 900)),
  };
});

export const returns: ReturnItem[] = Array.from({ length: 48 }).map((_, i) => {
  const customer = customers[i % customers.length];
  const product = pick(products);
  const qty = 1 + Math.floor(rand() * 2);
  const refund = product.price * qty;
  const status = i < 8 ? "pending" : pick(statuses);
  const submitted = daysAgo(i + Math.floor(rand() * 3));
  return {
    id: `RTN-${(290 - i).toString().padStart(5, "0")}`,
    customer: { id: customer.id, name: customer.name, email: customer.email },
    product,
    qty,
    reason: pick(reasons),
    explanation: pick(explanations),
    refundAmount: refund,
    submittedAt: submitted,
    updatedAt: submitted,
    status,
    orderId: `ORD-${(50000 + i * 13).toString()}`,
    orderDate: daysAgo(i + 14),
    shippingAddress: `${100 + i} Maple Street, Brooklyn, NY 11201`,
    paymentMethod: `Visa ···${(4000 + i).toString().slice(-4)}`,
    notes:
      i % 4 === 0
        ? [
            {
              id: `n-${i}-1`,
              author: "Jordan (Support)",
              createdAt: daysAgo(i),
              text: "Customer contacted via chat — confirmed item condition.",
            },
          ]
        : [],
  };
});

export const activity: ActivityEvent[] = [
  { id: "a1", type: "approved", message: "Jordan approved return #RTN-00287", ts: minsAgo(2) },
  {
    id: "a2",
    type: "submitted",
    message: "New return #RTN-00290 submitted by Olivia Carter",
    ts: minsAgo(14),
  },
  {
    id: "a3",
    type: "refunded",
    message: "Refund of $149.00 issued for #RTN-00284",
    ts: minsAgo(48),
  },
  { id: "a4", type: "rejected", message: "Mira rejected return #RTN-00281", ts: minsAgo(120) },
  { id: "a5", type: "note", message: "Note added to #RTN-00279 by Priya", ts: minsAgo(190) },
  { id: "a6", type: "approved", message: "Jordan approved return #RTN-00276", ts: minsAgo(310) },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "new",
    message: "New return submitted: #RTN-00290",
    ts: minsAgo(5),
    read: false,
  },
  {
    id: "n2",
    type: "approved",
    message: "Refund issued for #RTN-00284",
    ts: minsAgo(60),
    read: false,
  },
  {
    id: "n3",
    type: "flagged",
    message: "Customer flagged: high return rate",
    ts: minsAgo(180),
    read: false,
  },
  {
    id: "n4",
    type: "system",
    message: "Weekly report is ready to view",
    ts: minsAgo(240),
    read: true,
  },
  {
    id: "n5",
    type: "approved",
    message: "Refund issued for #RTN-00270",
    ts: minsAgo(720),
    read: true,
  },
];

export const reasonsBreakdown: { label: ReturnReason; value: number }[] = [
  { label: "Wrong Item", value: 312 },
  { label: "Damaged", value: 268 },
  { label: "Changed Mind", value: 401 },
  { label: "Quality Issue", value: 184 },
  { label: "Other", value: 119 },
];

export const monthlyVolume = [
  { m: "Jun", v: 84 },
  { m: "Jul", v: 96 },
  { m: "Aug", v: 110 },
  { m: "Sep", v: 102 },
  { m: "Oct", v: 132 },
  { m: "Nov", v: 158 },
  { m: "Dec", v: 201 },
  { m: "Jan", v: 124 },
  { m: "Feb", v: 138 },
  { m: "Mar", v: 152 },
  { m: "Apr", v: 167 },
  { m: "May", v: 184 },
];

export const monthlyRefunds = monthlyVolume.map((m) => ({
  m: m.m,
  v: m.v * (130 + Math.round(Math.random() * 60)),
}));

export const team = [
  {
    id: "u1",
    name: "Jordan Reyes",
    email: "jordan@lreturns.io",
    role: "Admin",
    lastActive: minsAgo(3),
  },
  {
    id: "u2",
    name: "Mira Patel",
    email: "mira@lreturns.io",
    role: "Staff",
    lastActive: minsAgo(45),
  },
  {
    id: "u3",
    name: "Priya Khan",
    email: "priya@lreturns.io",
    role: "Staff",
    lastActive: minsAgo(180),
  },
  {
    id: "u4",
    name: "Sam Holland",
    email: "sam@lreturns.io",
    role: "Viewer",
    lastActive: minsAgo(1500),
  },
];

export const integrations = [
  { name: "Shopify", description: "Sync orders & products from your storefront", connected: true },
  { name: "WooCommerce", description: "Sync WooCommerce orders & inventory", connected: false },
  { name: "Stripe", description: "Process refunds directly to original payment", connected: true },
  { name: "Klaviyo", description: "Trigger return-status email flows", connected: false },
  { name: "Zendesk", description: "Open a ticket from any return", connected: true },
  { name: "QuickBooks", description: "Sync refunds & restocking to your books", connected: false },
];
