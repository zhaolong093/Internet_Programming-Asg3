export type ReturnStatus = "pending" | "approved" | "rejected" | "processing" | "refunded";
export type ReturnReason = "Wrong Item" | "Damaged" | "Changed Mind" | "Quality Issue" | "Other";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalReturns: number;
  returnRate: number;
  ltv: number;
  status: "Active" | "Flagged" | "Blocked";
  lastActivity: string;
  customerSince: string;
}

export interface ReturnItem {
  id: string;
  customer: Pick<Customer, "id" | "name" | "email">;
  product: { name: string; sku: string; variant?: string; price: number };
  qty: number;
  reason: ReturnReason;
  explanation: string;
  refundAmount: number;
  submittedAt: string;
  updatedAt: string;
  status: ReturnStatus;
  orderId: string;
  orderDate: string;
  shippingAddress: string;
  paymentMethod: string;
  notes: { id: string; author: string; createdAt: string; text: string }[];
}

export interface ActivityEvent {
  id: string;
  type: "approved" | "rejected" | "submitted" | "refunded" | "note";
  message: string;
  ts: string;
}

export interface AppNotification {
  id: string;
  type: "new" | "approved" | "flagged" | "system";
  message: string;
  ts: string;
  read: boolean;
}