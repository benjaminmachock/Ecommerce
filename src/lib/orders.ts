import type { OrderStatus } from "@/generated/prisma/client";

/** Allowed status changes. Shipped and cancelled orders are final. */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: [],
  CANCELLED: [],
};

export const STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
export const orderRef = (id: string) => `#${id.slice(-8).toUpperCase()}`;
