// src/pages/History.jsx
import React, { useState, useEffect } from "react";
import {FaTimes, FaTruck, FaBox, FaCalendarAlt, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import { useContext } from "react";
import { AppPasswordContext } from "../App"; // adjust path if needed




export default function History() {
    const [showClearModal, setShowClearModal] = useState(false);
    const [showClearHistory, setShowClearHistory] = useState(false);
    const { appPassword } = useContext(AppPasswordContext);
    
const [clearFromDate, setClearFromDate] = useState("");
const [clearToDate, setClearToDate] = useState("");
const [passwordInput, setPasswordInput] = useState("");

  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentBills = filteredBills.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
// unique trucks directly from bills
const availableTrucks = [...new Set(bills.map(b => b.truck.number))];

 useEffect(() => {
  const loadBills = async () => {
    const { value } = await Preferences.get({ key: "bills" });
    const storedBills = value ? JSON.parse(value) : [];

    // Remove duplicates
    const uniqueBills = storedBills.filter((bill, index, self) =>
      index === self.findIndex(
        (b) =>
          b.truck.number === bill.truck.number &&
          b.material.name === bill.material.name &&
          b.date === bill.date &&
          b.time === bill.time &&
          b.dacNumber === bill.dacNumber
      )
    );

    setBills(uniqueBills);
    setFilteredBills(uniqueBills);
  };
  loadBills();
}, []);

  const toggleFilter = () => setShowFilter(!showFilter);

  const applyFilter = () => {
    let filtered = bills;
    if (selectedTruck) filtered = filtered.filter(b => b.truck.number === selectedTruck);
    if (selectedMaterial) filtered = filtered.filter(b => b.material.name === selectedMaterial);
    if (selectedDate) filtered = filtered.filter(b => b.date === selectedDate);

    setFilteredBills(filtered);
    setShowFilter(false); // close filter after apply
  };

  const clearFilter = () => {
    setSelectedTruck("");
    setSelectedMaterial("");
    setSelectedDate("");
    setFilteredBills(bills);
    setShowFilter(false);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, "0")}/${
      (d.getMonth() + 1).toString().padStart(2, "0")
    }/${d.getFullYear()}`;
  };

  const materials = [...new Set(bills.map(b => b.material.name))];
  // Example trucks list from Trucks page





  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/truck-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
      }}
    >
        {/* Back button */}
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: window.innerWidth <= 480 ? "10px" : "20px",
    left: window.innerWidth <= 480 ? "10px" : "20px",
    width: window.innerWidth <= 480 ? "40px" : "50px",
    height: window.innerWidth <= 480 ? "40px" : "50px",
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: window.innerWidth <= 480 ? "20px" : "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    transition: "0.2s",
  }}
  onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
  onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
>
  ←
</button>
      <h1 style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
        📜 Bill History
      </h1>

      {/* Filter Button */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <button
          onClick={toggleFilter}
          style={{
            padding: "10px 15px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔍 Filter
        </button>

        {showFilter && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              left: 0,
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              width: "300px",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Close X Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  background: "orange",
                  color: "white",
                  border: "none",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Truck Select */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaTruck />
              <select
  value={selectedTruck}
  onChange={(e) => setSelectedTruck(e.target.value)}
>
  <option value="">Select Truck</option>
  {availableTrucks.map((truckNum) => {
    const truck = bills.find(b => b.truck.number === truckNum)?.truck;
    return (
      <option key={truckNum} value={truckNum}>
        {truckNum} - {truck?.name}
      </option>
    );
  })}
</select>
            </div>

            {/* Material Select */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaBox />
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Material</option>
                {materials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaCalendarAlt />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {/* Apply & Clear Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={applyFilter}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>

              <button
                onClick={clearFilter}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Headers */}
      <div
        style={{
          display: "flex",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "10px",
          fontWeight: "bold",
          borderRadius: "6px",
          marginBottom: "5px",
          flexWrap: "wrap",
          color: "#040404ff",
        }}
      >
        <div style={{ flex: 1 }}>Truck #</div>
        <div style={{ flex: 1 }}>Material</div>
        <div style={{ flex: 1 }}>Net Qty (MT) </div>
        <div style={{ flex: 1 }}>Transport</div>
        <div style={{ flex: 1 }}>Date</div>
        <div style={{ flex: 1 }}>Time</div>
        <div style={{ flex: 1 }}>Action</div>
      </div>

      {/* Bills List */}
      {currentBills.map((bill) => (
        <div
          key={bill.id}
          style={{
            display: "flex",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: "10px",
            marginBottom: "5px",
            borderRadius: "6px",
            borderBottom: "1px solid #ccc",
            flexWrap: "wrap",
            color: "#040404ff",
          }}
        >
          <div style={{ flex: 1 }}>{bill.truck.number}</div>
          <div style={{ flex: 1 }}>{bill.material.name}</div>
          <div style={{ flex: 1 }}>{bill.netQty}</div>
          <div style={{ flex: 1 }}>{bill.truck.name}</div>
          <div style={{ flex: 1 }}>{formatDate(bill.date)}</div>
          <div style={{ flex: 1 }}>{bill.time}</div>
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setViewBill(bill)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              <FaEye /> View
            </button>
          </div>
        </div>
      ))}

      {filteredBills.length === 0 && (
        <p style={{ textAlign: "center", color: "white" }}>No bills found.</p>
      )}

      {/* Bill Details Modal */}
      {viewBill && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200,
            padding: "20px",
            overflowY: "auto",
            
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
              position: "relative",
              color:"black"
            }}
          >
            <button
              onClick={() => setViewBill(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "red",
                
              }}
            >
              <FaTimes /> 
            </button>

            <h2 style={{ textAlign: "center", marginBottom: "15px",color:"black" }}>Bill Details</h2>

            <div><strong>Truck:</strong> {viewBill.truck.number} - {viewBill.truck.name}</div>
            <div><strong>Material:</strong> {viewBill.material.name}</div>
            <div><strong>Net Qty (MT):</strong> {viewBill.netQty}</div>
            
            <div><strong>Transport:</strong> {viewBill.truck.name}</div>
            <div><strong>Loading:</strong> {viewBill.loading}</div>
            <div><strong>Unloading:</strong> {viewBill.unloading}</div>
            <div><strong>Payment Mode:</strong> {viewBill.paymentMode}</div>
            <div><strong>DAC/Ref #:</strong> {viewBill.dacNumber}</div>
            <div><strong>Date:</strong> {formatDate(viewBill.date)}</div>
            <div><strong>Time:</strong> {viewBill.time}</div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "10px" }}>
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    style={{ padding: "6px 12px", cursor: "pointer" }}
  >
    Previous
  </button>

  <span>Page {currentPage} of {totalPages}</span>

  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    style={{ padding: "6px 12px", cursor: "pointer" }}
  >
    Next
  </button>
</div>
<button
  onClick={() => setShowClearModal(true)}
  style={{
    padding: "10px 15px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px"
  }}
>
  🗑️ Clear History
</button>
{showClearModal && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200
  }}>
    <div style={{
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      width: "300px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
     {/* Clear History Section */}
<div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "rgba(255,255,255,0.9)", padding: "15px", borderRadius: "8px" }}>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  }}
>
  <h3 style={{ margin: 0 }}>🗑️ Clear History</h3>
  <button
    onClick={() => setShowClearModal(false)}
    style={{
      background: "transparent",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      padding: "2px 6px",
      color: "red",
    }}
  >
    ✖
  </button>
</div>
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <input
      type="date"
      value={clearFromDate}
      onChange={(e) => setClearFromDate(e.target.value)}
      style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
      placeholder="From Date"
    />
    <input
      type="date"
      value={clearToDate}
      onChange={(e) => setClearToDate(e.target.value)}
      style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
      placeholder="To Date"
    />
    <input
      type="password"
      value={passwordInput}
      onChange={(e) => setPasswordInput(e.target.value)}
      style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
      placeholder="Password"
    />
  </div>
  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
    <button
  onClick={async () => {
    if (passwordInput !== appPassword) {
  alert("❌ Incorrect password!");
  return;
}

    if (!clearFromDate || !clearToDate) {
      alert("⚠️ Select both from and to dates to clear a range!");
      return;
    }

    const from = new Date(clearFromDate);
    const to = new Date(clearToDate);
    const remaining = bills.filter((b) => {
      const billDate = new Date(b.date);
      return billDate < from || billDate > to;
    });

    // Replace localStorage with Capacitor Preferences
    await Preferences.set({
      key: "bills",
      value: JSON.stringify(remaining),
    });

    setBills(remaining);
    setFilteredBills(remaining);
    setClearFromDate("");
    setClearToDate("");
    setPasswordInput("");
    alert("✅ Bills cleared for selected range!");
  }}
  style={{
    flex: 1,
    padding: "8px",
    backgroundColor: "orange",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
 
      Clear Range
    </button>

    <button
      onClick={async () => {
  if (passwordInput !== "admin123") {
    alert("❌ Incorrect password!");
    return;
  }
  if (!window.confirm("⚠️ Are you sure you want to delete all history?")) return;

  await Preferences.remove({ key: "bills" });  // ⬅️ replaces localStorage.removeItem
  setBills([]);
  setFilteredBills([]);
  setClearFromDate("");
  setClearToDate("");
  setPasswordInput("");
  alert("✅ All bills deleted!");
}}
style={{
  flex: 1,
  padding: "8px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
}}
>
      Delete All
    </button>
  </div>
</div>
    </div>
  </div>
)}

    </div>
    
  
);
}
