// src/pages/GenerateBill.jsx
import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GenerateBill5() {
  const navigate = useNavigate();
  const location = useLocation();
  const billRef = useRef(null);
  const iframeRef = useRef(null);

  // ✅ Get bill data passed from CreateBill2
  const {
  truck,
  date,
  time,
  load,
  total,
  dacNumber,
  material,
  party,
  loading,
  unloading,
  transport,
  paymentMode
} = location.state || {};

  if (!truck) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">
          ⚠️ No bill data found! Please go back and create a bill.
        </p>
        <button
          onClick={() => navigate("/create-bill")}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  // ✅ Format date -> dd/mm/yyyy
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ Format time -> hh:mm am/pm
  const formatTime = (t) => {
    if (!t) return "";
    const [h, mPart] = t.split(":");
    const minutes = mPart?.split(" ")[0] || "00";
    const ampm = (mPart?.split(" ")[1] || "AM").toLowerCase();
    return `${h}:${minutes} ${ampm}`;
  };

  const handlePrint = () => {
    if (!billRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Inject bill HTML into iframe
    doc.open();
    doc.write(`
  <html>
    <head>
      <style>
        @media print {
          @page {
            size: 72mm auto; /* width fixed, height auto */
            margin: 0; /* remove extra margins */
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Consolas, monospace;
          }
          .bill-container {
            width: 72mm;
            padding: 10px 5px;
            box-sizing: border-box;
          }
          hr { border: none; border-top: 1px solid #000; }
          div { margin: 3px 0; }
        }

        /* Ensure preview in iframe looks correct */
        body { margin: 0; padding: 0; font-family: Consolas, monospace; }
        .bill-container { width: 72mm; padding: 10px 5px; box-sizing: border-box; }
        hr { border: none; border-top: 1px solid #000; }
        div { margin: 3px 0; }
      </style>
    </head>
    <body>
      ${billRef.current.outerHTML}
    </body>
  </html>
`);

    doc.close();

    // Wait for content to render, then print
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/truck-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        gap: "20px",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/create-bill")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        ←
      </button>

      <h1 style={{ color: "white", fontSize: "2rem", marginBottom: "20px" }}>
        🧾 Generated Bill 5 MINE E
      </h1>

      {/* Bill Preview */}
      <div
        ref={billRef}
        className="bill-container"
        style={{
          padding: "20px",
          width: "72mm",
          minHeight: "210mm",
          backgroundColor: "#fff",
          fontFamily: "Consolas, monospace",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Delivery Challan
        </h2>
        <div style={{ textAlign: "center" }}>
          Date: {formatDate(date)} {formatTime(time)}
        </div>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          DC/Ref #: {dacNumber}
        </div>
        <hr />
        <h3 style={{ textAlign: "center", margin: "10px 0" }}>OUTGOING TRIP</h3>

        <div>
        Party: <span style={{ float: "right" }}>{party || truck?.name}</span>
        </div>
        <div>
        Loading: <span style={{ float: "right" }}>{loading || "CRUSHER"}</span>
        </div>
        <div>
        Unloading: <span style={{ float: "right" }}>{unloading || "Party Site"}</span>
        </div>
        <div>
        Transport: <span style={{ float: "right" }}>{transport || ""}</span>
        </div>
        <div>
          Truck #: <span style={{ float: "right" }}>{truck?.number}</span>
        </div>
        <div>
        Item: <span style={{ float: "right" }}>{material?.name || "N/A"}</span>
        </div>
        <div>
          Empty Qty:{" "}
          <span style={{ float: "right" }}>{truck?.emptyWeight} MT</span>
        </div>
        <div>
          Full Qty: <span style={{ float: "right" }}>{total} MT</span>
        </div>
        <div>
          Net Qty:{" "}
          <span style={{ float: "right" }}>
            {(total - truck?.emptyWeight).toFixed(2)} MT
          </span>
        </div>
        <div>
        Payment Mode: <span style={{ float: "right" }}>{paymentMode || "Cash"}</span>
        </div>
      </div>

      {/* Hidden Iframe */}
      <iframe
        ref={iframeRef}
        title="print-frame"
        style={{ display: "none" }}
      ></iframe>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        style={{
          marginTop: "20px",
          background: "green",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🖨️ Print Bill
      </button>
    </div>
  );
}
