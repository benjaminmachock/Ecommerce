"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendShippedEmail } from "@/lib/order-email";
import { TRANSITIONS } from "@/lib/orders";
import { orderUpdateSchema } from "@/lib/validation";

export type OrderFormState = { error?: string; ok?: boolean } | undefined;

export async function updateOrder(id: string, _: OrderFormState, form: FormData): Promise<OrderFormState> {
  await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    status: form.get("status"),
    trackingNumber: form.get("trackingNumber") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { status, trackingNumber } = parsed.data;

  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return { error: "Order not found." };

  if (status !== order.status && !TRANSITIONS[order.status].includes(status)) {
    return { error: `Can't move an order from ${order.status} to ${status}.` };
  }

  // updateMany with the previous status guards against two admins racing on the same order.
  const res = await db.order.updateMany({
    where: { id, status: order.status },
    data: {
      status,
      trackingNumber: trackingNumber || null,
      ...(status === "SHIPPED" && order.status !== "SHIPPED" ? { shippedAt: new Date() } : {}),
    },
  });
  if (res.count === 0) return { error: "This order was just changed by someone else. Reload and try again." };

  // No-op unless the order is shipped and the email hasn't gone out yet.
  if (status === "SHIPPED") await sendShippedEmail(id);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");
  return { ok: true };
}
