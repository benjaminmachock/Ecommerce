"use client";

import { useActionState } from "react";
import { updateOrder, type OrderFormState } from "@/actions/admin-orders";
import { TRANSITIONS } from "@/lib/orders";

type Status = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export function OrderStatusForm({ id, status, trackingNumber }: { id: string; status: Status; trackingNumber: string }) {
  const [state, action, pending] = useActionState<OrderFormState, FormData>(updateOrder.bind(null, id), undefined);
  const options = [status, ...TRANSITIONS[status]];
  const final = options.length === 1;

  return (
    <form action={action} className="pf-fields" noValidate>
      <label>Status
        <select name="status" defaultValue={status} disabled={final}>
          {options.map((s) => <option key={s}>{s}</option>)}
        </select>
        {final && <input type="hidden" name="status" value={status} />}
      </label>
      <label>Tracking number
        <input name="trackingNumber" defaultValue={trackingNumber} maxLength={60} placeholder="Optional" />
      </label>
      <button className="btn btn-dark" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      <p className="form-error" role="alert">{state?.error}</p>
      {state?.ok && <p role="status" className="added">Saved.</p>}
    </form>
  );
}
