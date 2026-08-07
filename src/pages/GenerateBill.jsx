// src/pages/GenerateBill.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../fonts.css";
import ConsolasRegular from "../assets/fonts/Consolas-Regular.ttf";
import ConsolasItalic from "../assets/fonts/Consolas-Italic.ttf";
import ConsolasBold from "../assets/fonts/Consolas-Bold.ttf";
import ConsolasBoldItalic from "../assets/fonts/Consolas-BoldItalic.ttf";

// Capacitor placeholders
let Filesystem, Directory;
if (Capacitor.isNativePlatform()) {
  import("@capacitor/filesystem").then((mod) => {
    Filesystem = mod.Filesystem;
    Directory = mod.Directory;
  });
}

/* 🔑 ANDROID WEBVIEW FIX: force black paint */
const forceBlackText = (root) => {
  if (!root) return;
  root.querySelectorAll("*").forEach((el) => {
    el.style.color = "#000";
    el.style.webkitTextFillColor = "#000";
  });
};

export default function GenerateBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const billRef = useRef(null);
  const iframeRef = useRef(null);
  const [pdfFileUri, setPdfFileUri] = useState(null);

  const {
    truck,
    date,
    time,
    total,
    dacNumber,
    material,
    party,
    loading,
    unloading,
    transport,
    paymentMode,
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

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  // -----------------------------
  // PDF generation
  // -----------------------------
  useEffect(() => {
    const generatePdf = async () => {
      if (!billRef.current) return;

      const loadFonts = async () => {
        const regular = new FontFace("Consolas", `url(${ConsolasRegular})`);
        const italic = new FontFace("Consolas", `url(${ConsolasItalic})`, { style: "italic" });
        const bold = new FontFace("Consolas", `url(${ConsolasBold})`, { weight: "bold" });
        const boldItalic = new FontFace("Consolas", `url(${ConsolasBoldItalic})`, {
          weight: "bold",
          style: "italic",
        });

        document.fonts.add(await regular.load());
        document.fonts.add(await italic.load());
        document.fonts.add(await bold.load());
        document.fonts.add(await boldItalic.load());
        await document.fonts.ready;
      };

      await loadFonts();

      // 🔑 Critical for Android
      forceBlackText(billRef.current);

      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", [66, 200]);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 66;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      if (Capacitor.isNativePlatform() && Filesystem) {
        const pdfData = pdf.output("arraybuffer");
        const base64 = btoa(
          new Uint8Array(pdfData).reduce((d, b) => d + String.fromCharCode(b), "")
        );

        const saved = await Filesystem.writeFile({
          path: `bill_${Date.now()}.pdf`,
          data: base64,
          directory: Directory.External,
          recursive: true,
        });

        setPdfFileUri(saved.uri);
      } else {
        pdf.save(`bill_${Date.now()}.pdf`);
      }
    };

    generatePdf();
  }, []);

  // -----------------------------
  // Print handler
  // -----------------------------
  const handlePrint = () => {
    if (Capacitor.isNativePlatform()) {
      if (window.Android?.openPdf && pdfFileUri) {
        window.Android.openPdf(pdfFileUri);
      }
      return;
    }

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(`
<html>
<head>
<style>
@page { size: 66mm auto; margin: 0; }
body {
  margin: 0;
  font-family: Consolas, monospace;
  background: #fff;
  color: #000;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.bill-container, .bill-container * {
  color: #000 !important;
  -webkit-text-fill-color: #000 !important;
}
.bill-container {
  width: 66mm;
  padding: 4mm;
  line-height: 1.2;
}
hr { border-top: 1px solid #000; border: none; }
div { margin: 1.2mm 0; }
</style>
</head>
<body>${billRef.current.outerHTML}</body>
</html>
`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/truck-bg.jpg')",
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        position: "relative",
      }}
    >
      <button
        onClick={() => navigate("/create-bill")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          fontSize: 24,
        }}
      >
        ←
      </button>

      <h1 style={{ color: "white", marginBottom: 20 }}>🧾 Generated Bill</h1>

      {/* BILL PREVIEW */}
      <div
        ref={billRef}
        className="bill-container"
        style={{
          width: "66mm",
          padding: "4mm",
          fontSize: "12px",
          lineHeight: "1.2",
          fontFamily: "Consolas, monospace",
          backgroundColor: "#fff",
          color: "#000",
          boxSizing: "border-box",
          isolation: "isolate", // 🔑 FINAL ANDROID FIX
        }}
      >
        <h4 style={{ textAlign: "center", margin: "5mm 0 4mm" }}>Delivery Challan</h4>
        <div style={{ textAlign: "center", fontSize: "10px" }}>
          Date: {formatDate(date)} {time}
        </div>
        <div style={{ textAlign: "center", marginBottom: "2mm" }}>
          DC/Ref #: <b>{dacNumber}</b>
        </div>
        <hr />
        <h4 style={{ textAlign: "center", margin: "-1mm 0 4mm" }}>OUTGOING TRIP</h4>
      <div style={{marginBottom: "2mm"}}>Party: <span style={{ float: "right" }}>{party}</span></div>
        <div style={{marginBottom: "2mm"}}>Loading: <span style={{ float: "right" }}>{loading}</span></div>
        <div style={{marginBottom: "2mm"}}>Unloading: <span style={{ float: "right" }}>{unloading}</span></div>
        <div style={{marginBottom: "2mm"}}>Transport: <span style={{ float: "right" }}>{transport}</span></div>
        <div style={{marginBottom: "2mm"}}>Truck #: <span style={{ float: "right" }}>{truck.number}</span></div>
        <div style={{marginBottom: "2mm"}}>Item: <span style={{ float: "right" }}>{material?.name}</span></div>
        <div style={{marginBottom: "2mm"}}>Empty Qty: <span style={{ float: "right" }}>{truck.emptyWeight} MT</span></div>
        <div style={{marginBottom: "2mm"}}>Full Qty: <span style={{ float: "right" }}>{total} MT</span></div>
        <div >
          Net Qty:
          <span style={{ float: "right" }}>
            {(total - truck.emptyWeight).toFixed(2)} MT
          </span>
        </div>
        <div style={{ marginTop: "3mm",marginBottom:"5mm"}}>
          Payment:
          <span style={{ float: "right" }}>{paymentMode || "Cash"}</span>
        </div>
        <hr />
      </div>

      <iframe ref={iframeRef} style={{ display: "none" }} />

      <button
        onClick={handlePrint}
        style={{
          marginTop: 20,
          background: "green",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
        }}
      >
        🖨️ Print Bill
      </button>
    </div>
  );
}
