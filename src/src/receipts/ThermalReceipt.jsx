import React, { forwardRef } from "react";
import { formatQuantity, formatReceiptDate } from "./normalizeBill";

const Row = ({ label, value, emphasized = false }) => (
  <div style={{ marginBottom: "2mm", fontWeight: emphasized ? "bold" : "normal" }}>
    {label}: <span style={{ float: "right" }}>{value}</span>
  </div>
);

const ThermalReceipt = forwardRef(function ThermalReceipt({ receipt, template }, ref) {
  return (
    <div
      ref={ref}
      className="bill-container thermal-receipt"
      style={{
        width: `${template.paperWidthMm}mm`, padding: `${template.paddingMm}mm`, fontSize: "12px",
        lineHeight: "1.2", fontFamily: "Consolas, monospace", backgroundColor: "#fff", color: "#000",
        boxSizing: "border-box", isolation: "isolate",
      }}
    >
      <h4 style={{ textAlign: "center", margin: "5mm 0 4mm" }}>{template.title}</h4>
      <div style={{ textAlign: "center", fontSize: "10px" }}>
        Date: {formatReceiptDate(receipt.issuedAt.date)} {receipt.issuedAt.time}
      </div>
      <div style={{ textAlign: "center", marginBottom: "2mm" }}>DC/Ref #: <b>{receipt.referenceNumber}</b></div>
      <hr />
      <h4 style={{ textAlign: "center", margin: "-1mm 0 4mm" }}>{template.tripTitle}</h4>
      <Row label="Party" value={receipt.trip.party} />
      <Row label="Loading" value={receipt.trip.loading} />
      <Row label="Unloading" value={receipt.trip.unloading} />
      <Row label="Transport" value={receipt.trip.transport} />
      <Row label="Truck #" value={receipt.truck.number} />
      <Row label="Item" value={receipt.material.name} />
      <Row label="Empty Qty" value={formatQuantity(receipt.quantities.empty)} />
      <Row label="Full Qty" value={formatQuantity(receipt.quantities.full)} />
      <Row label="Net Qty" value={formatQuantity(receipt.quantities.net, 2)} />
      <div style={{ marginTop: "3mm", marginBottom: "5mm" }}>
        Payment: <span style={{ float: "right" }}>{receipt.paymentMode}</span>
      </div>
      <hr />
    </div>
  );
});

export default ThermalReceipt;
