// src/pages/GenerateCustomBill.jsx
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
import { Preferences } from "@capacitor/preferences";

// Capacitor placeholders
let Filesystem, Directory;
if (Capacitor.isNativePlatform()) {
  import("@capacitor/filesystem").then((mod) => {
    Filesystem = mod.Filesystem;
    Directory = mod.Directory;
  });
}

export default function GenerateCustomBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const billRef = useRef(null);
  const iframeRef = useRef(null);
  const [pdfFileUri, setPdfFileUri] = useState(null);

  const bill = location.state;

  if (!bill) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">
          ⚠️ No bill data found! Please go back and create a bill.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  const {
    truck,
    mine,
    material,
    date,
    time,
    load,
    emptyWeight,
    total,
    dacNumber,
    party,
    loading,
    unloading,
    transport,
    paymentMode,
    customInput,
  } = bill;

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTime = (t) => (t ? t : "");

  // Save printed bill to history
  const saveBillToHistory = async () => {
    const newBill = {
      id: Date.now(),
      date,
      time,
      truck: { name: truck?.name, number: truck?.number },
      mine: mine?.name,
      material: { name: material?.name || "N/A" },
      load,
      emptyWeight,
      total,
      dacNumber,
      party,
      loading,
      unloading,
      transport,
      paymentMode,
      customInput,
      createdAt: new Date().toISOString(),
    };

    const { value } = await Preferences.get({ key: "bills" });
    const existing = value ? JSON.parse(value) : [];
    existing.unshift(newBill);
    await Preferences.set({ key: "bills", value: JSON.stringify(existing) });
    localStorage.setItem("lastDac", dacNumber);
    await Preferences.set({ key: "recentBill", value: JSON.stringify(newBill) });
    console.log("✅ Custom bill saved to history");
  };

  // Generate PDF
  useEffect(() => {
    const generatePdf = async () => {
      if (!billRef.current) return;

      const loadFonts = async () => {
        const regular = new FontFace("Consolas", `url(${ConsolasRegular})`);
        const italic = new FontFace("Consolas", `url(${ConsolasItalic})`, { style: "italic" });
        const bold = new FontFace("Consolas", `url(${ConsolasBold})`, { weight: "bold" });
        const boldItalic = new FontFace("Consolas", `url(${ConsolasBoldItalic})`, { weight: "bold", style: "italic" });

        document.fonts.add(await regular.load());
        document.fonts.add(await italic.load());
        document.fonts.add(await bold.load());
        document.fonts.add(await boldItalic.load());
        await document.fonts.ready;
      };

      await loadFonts();

      const canvas = await html2canvas(billRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", [72, 200]);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 72;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `custom_bill_${Date.now()}.pdf`;

      if (Capacitor.isNativePlatform() && Filesystem) {
        const pdfData = pdf.output("arraybuffer");
        const base64Data = btoa(
          new Uint8Array(pdfData).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.External,
          recursive: true,
        });
        setPdfFileUri(savedFile.uri);
        console.log("✅ PDF saved at:", savedFile.uri);
      } else {
        pdf.save(fileName);
        console.log("✅ PDF generated in browser.");
      }
    };

    generatePdf();
  }, []);

  // Print handler
  const handlePrint = async () => {
    if (Capacitor.isNativePlatform()) {
      if (window.Android?.openPdf && pdfFileUri) {
        window.Android.openPdf(pdfFileUri);
        await saveBillToHistory();
      } else {
        alert("❌ Android bridge not available yet.");
      }
    } else {
      if (!billRef.current) return;
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              @media print {
                @page { size: 72mm auto; margin: 0; }
                body { margin: 0; padding: 0; font-family: Consolas, monospace; }
                .bill-container { width: 72mm; padding: 10px 5px; box-sizing: border-box; }
                hr { border: none; border-top: 1px solid #000; }
                div { margin: 3px 0; }
              }
              body { margin: 0; padding: 0; font-family: Consolas, monospace; }
              .bill-container { width: 72mm; padding: 10px 5px; box-sizing: border-box; }
              hr { border: none; border-top: 1px solid #000; }
              div { margin: 3px 0; }
            </style>
          </head>
          <body>${billRef.current.outerHTML}</body>
        </html>
      `);
      doc.close();
      await saveBillToHistory();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 300);
    }
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
      <button
        onClick={() => navigate(-1)}
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
        🧾 Custom Bill
      </h1>

      {/* Bill content */}
      <div
        ref={billRef}
        className="bill-container"
        style={{
          padding: "10px",
          margin: "5px auto",
          width: "250px",
          fontSize: "12px",
          color: "#000000",
          fontWeight: "normal",
          boxSizing: "border-box",
          fontFamily: "Consolas, monospace",
          backgroundColor: "white",
        }}
      >
        <h3 style={{ textAlign: "center", margin: "20px 0 5px" }}>{customInput}</h3>
        <h4 style={{ textAlign: "center", margin: "2px 0 " }}>Delivery Challan</h4>
        <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "" }}>
          Date: {formatDate(date)} {formatTime(time)}
        </div>
        <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "10px" }}>
          DC/Ref #: {dacNumber}
        </div>
        <hr/>
        <h4 style={{ textAlign: "center", margin: "-1mm 0 2mm " }}>OUTGOING TRIP</h4>
        <div style={{ marginBottom: "8px" }}>
          Party: <span style={{ float: "right" }}>{truck?.name} </span>
        </div>
        
        <div style={{ marginBottom: "8px" }}>
          Loading: <span style={{ float: "right" }}>{loading}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Unloading: <span style={{ float: "right" }}>{unloading}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Transport: <span style={{ float: "right" }}>{truck?.name} </span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Truck #: <span style={{ float: "right" }}>{truck?.number}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Item: <span style={{ float: "right" }}>{material?.name}</span>
        </div>
        
        <div style={{ marginBottom: "8px" }}>
          Empty Qty: <span style={{ float: "right" }}>{emptyWeight} kg</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Full Qty: <span style={{ float: "right" }}>{total} kg</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          Net Qty: <span style={{ float: "right" }}>{load} kg</span>
        </div>
        
        <div style={{ marginBottom: "8px" }}>
          Payment Mode: <span style={{ float: "right" }}>{paymentMode}</span>
        </div>
        <div style={{textAlign:"center",marginTop:"6mm",marginBottom:"5mm"}}>
        <h5 style={{marginBottom:"-4mm"}}> Thank you for your business.</h5>
        <h5 style={{marginBottom:"-4mm"}}> Please visit {customInput} </h5>
        <h5> Call .to know more. </h5>
        </div>
      </div>

      {/* Hidden iframe for printing */}
      <iframe ref={iframeRef} title="print-frame" style={{ display: "none" }}></iframe>

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
        🖨️ Print Custom Bill
      </button>
    </div>
  );
}
