// src/pages/GenerateBill2.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* 🔑 ANDROID WEBVIEW FONT COLOR FIX */
const forceBlackText = (root) => {
  if (!root) return;
  root.querySelectorAll("*").forEach((el) => {
    el.style.color = "#000";
    el.style.webkitTextFillColor = "#000";
  });
};

/* 🔢 KG FORMATTER (NO COMMAS) */
const formatKg = (value) => {
  if (value === null || value === undefined) return "";
  return Math.round(value).toString();
};

let Filesystem, Directory;
if (Capacitor.isNativePlatform()) {
  import("@capacitor/filesystem").then((m) => {
    Filesystem = m.Filesystem;
    Directory = m.Directory;
  });
}

export default function GenerateBill2() {
  const navigate = useNavigate();
  const location = useLocation();
  const billRef = useRef(null);
  const iframeRef = useRef(null);

  const [copyNumber, setCopyNumber] = useState(1);
  const [pdfFileUri, setPdfFileUri] = useState(null);

  const {
    truck,
    date,
    time,
    total,
    dacNumber,
    material,
    party,
  } = location.state || {};

  if (!truck) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">⚠️ No bill data found</p>
      </div>
    );
  }

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTime = (t) => t || "";

  // --------------------------------------------------
  // PDF GENERATION (ADDED — SAME AS GenerateBill.jsx)
  // --------------------------------------------------
  useEffect(() => {
    const generatePdf = async () => {
      if (!billRef.current) return;

      forceBlackText(billRef.current);

      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", [72, 200]);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 72;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      if (Capacitor.isNativePlatform() && Filesystem) {
        const pdfData = pdf.output("arraybuffer");
        const base64 = btoa(
          new Uint8Array(pdfData).reduce(
            (d, b) => d + String.fromCharCode(b),
            ""
          )
        );

        const saved = await Filesystem.writeFile({
          path: `bill2_${Date.now()}.pdf`,
          data: base64,
          directory: Directory.External,
          recursive: true,
        });

        setPdfFileUri(saved.uri);
      }
    };

    generatePdf();
  }, []);

  // --------------------------------------------------
  // PRINT HANDLER (FIXED — ANDROID + WEB)
  // --------------------------------------------------
  const handlePrint = () => {
    // ANDROID
    if (Capacitor.isNativePlatform()) {
      if (!pdfFileUri) {
        alert("Please wait, bill is preparing…");
        return;
      }
      if (window.Android?.openPdf) {
        window.Android.openPdf(pdfFileUri);
        setCopyNumber((prev) => (prev === 1 ? 2 : 1));
      }
      return;
    }

    // WEB (UNCHANGED)
    if (!billRef.current) return;

    forceBlackText(billRef.current);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            @media print {
              @page { size: 72mm auto; margin: 0; }
              body {
                margin: 0;
                font-family: monospace;
                background: #fff;
                color: #000;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .bill-container,
              .bill-container * {
                color: #000 !important;
                -webkit-text-fill-color: #000 !important;
              }
              .bill-container {
                width: 72mm;
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          ${billRef.current.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setCopyNumber((prev) => (prev === 1 ? 2 : 1));
    };
  };

  // --------------------------------------------------
  // UI — 100% UNCHANGED
  // --------------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/truck-bg.jpg')",
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        gap: "20px",
        position: "relative",
      }}
    >
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
        🧾 Generated Bill 2 MINE B
      </h1>

      <div
        ref={billRef}
        className="bill-container"
        style={{
          padding: "10px",
          width: "72mm",
          backgroundColor: "#fff",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          fontSize: "14px",
          fontWeight: 400,
          boxSizing: "border-box",
          fontFamily: "monospace",
          color: "#000",
          isolation: "isolate",
        }}
      >
        {/* YOUR EXISTING LAYOUT — UNTOUCHED */}
        {/* … */}
      </div>

      <iframe ref={iframeRef} style={{ display: "none" }} />

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
