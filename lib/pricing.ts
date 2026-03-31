const TAX_RATE = 0.09;

export function toCents(amount: number): number {
  // Guard against floating-point issues from UI and DB.
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
}

export function roundMoney(amount: number): number {
  return fromCents(toCents(amount));
}

export function calcOrderTotals(params: {
  itemsSubtotal: number; // dollars
  deliveryFee: number; // dollars
  taxRate?: number;
}) {
  const taxRate = params.taxRate ?? TAX_RATE;

  const itemsSubtotalCents = toCents(params.itemsSubtotal);
  const deliveryFeeCents = toCents(params.deliveryFee);
  const totalAmountCents = itemsSubtotalCents + deliveryFeeCents;

  // Round tax at cents precision.
  const taxAmountCents = Math.round(totalAmountCents * taxRate);
  const finalAmountCents = totalAmountCents + taxAmountCents;

  return {
    totalAmount: fromCents(totalAmountCents),
    taxAmount: fromCents(taxAmountCents),
    finalAmount: fromCents(finalAmountCents),
    totalAmountCents,
    taxAmountCents,
    finalAmountCents,
  };
}

export function calcTaxAndTotalFromCents(params: {
  subtotalCents: number;
  deliveryFeeCents: number;
  taxRate?: number;
}) {
  const taxRate = params.taxRate ?? TAX_RATE;
  const totalAmountCents = params.subtotalCents + params.deliveryFeeCents;
  const taxAmountCents = Math.round(totalAmountCents * taxRate);
  const finalAmountCents = totalAmountCents + taxAmountCents;
  return {
    totalAmountCents,
    taxAmountCents,
    finalAmountCents,
    totalAmount: fromCents(totalAmountCents),
    taxAmount: fromCents(taxAmountCents),
    finalAmount: fromCents(finalAmountCents),
  };
}

