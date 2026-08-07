import React from "react";

// ✅ Default export
export default function DeliveryChallan({ bill }) {
  const {
    dateTime,
    dcRef,
    party,
    loading,
    unloading,
    transport,
    truck,
    material,
    emptyQty,
    fullQty,
    netQty,
    paymentMode,
  } = bill;

  return (
    <div
      style={{
        width: "58mm",
        fontFamily: "monospace",
        padding: "5px",
        lineHeight: "1.4",
      }}
    >
      <h3 style={{ textAlign: "center" }}>Delivery Challan</h3>
      <p>Date: {dateTime}</p>
      <p>DC/Ref #: {dcRef}</p>
      <hr />
      <p><b>OUTGOING TRIP</b></p>
      <p>Party: {party}</p>
      <p>Loading: {loading}</p>
      <p>Unloading: {unloading}</p>
      <p>Transport: {transport}</p>
      <p>Truck #: {truck.number}</p>
      <p>Item: {material.name}</p>
      <p>Empty Qty: {emptyQty} MT</p>
      <p>Full Qty: {fullQty} MT</p>
      <p>Net Qty: {netQty} MT</p>
      <p>Payment Mode: {paymentMode}</p>
    </div>
  );
}
