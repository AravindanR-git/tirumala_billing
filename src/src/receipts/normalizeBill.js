const numberOrNull = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const text = (value, fallback = "") => (value === null || value === undefined ? fallback : String(value));

/**
 * Adapts legacy route-state bills and history bills to one stable receipt shape.
 * It intentionally does not write to storage, so existing records remain untouched.
 */
export function normalizeBillToReceipt(bill = {}) {
  const truck = bill.truck || {};
  const mine = bill.mine || {};
  const emptyWeight = numberOrNull(bill.emptyWeight ?? truck.emptyWeight) ?? 0;
  const fullWeight = numberOrNull(bill.total);
  const suppliedNet = numberOrNull(bill.load ?? bill.netQty);
  const netWeight = suppliedNet ?? (fullWeight === null ? 0 : fullWeight - emptyWeight);

  return {
    source: bill,
    templateId: mine.templateId || bill.templateId || "mineA",
    templateVersion: bill.templateVersion || 1,
    mine: { id: mine.id, name: text(mine.name) },
    issuedAt: { date: text(bill.date), time: text(bill.time) },
    referenceNumber: text(bill.dacNumber),
    trip: {
      party: text(bill.party, text(truck.name)),
      loading: text(bill.loading, "CRUSHER"),
      unloading: text(bill.unloading, "Party Site"),
      transport: text(bill.transport, text(truck.name)),
    },
    truck: { id: truck.id, name: text(truck.name), number: text(truck.number) },
    material: { id: bill.material?.id, name: text(bill.material?.name) },
    quantities: { empty: emptyWeight, full: fullWeight ?? emptyWeight + netWeight, net: netWeight },
    paymentMode: text(bill.paymentMode, "Cash"),
    customInput: text(bill.customInput),
  };
}

export const formatReceiptDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

export const formatQuantity = (value, fractionDigits) => {
  const number = numberOrNull(value) ?? 0;
  return `${fractionDigits === undefined ? String(number) : number.toFixed(fractionDigits)} MT`;
};
