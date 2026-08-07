// src/pages/Trucks.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppPasswordContext } from "../App"; // Import your app-wide password context

export default function Trucks() {
  const navigate = useNavigate();
  const { appPassword } = useContext(AppPasswordContext); // Use password from context

  const [trucks, setTrucks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [truckName, setTruckName] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [emptyWeight, setEmptyWeight] = useState("");
  const [image, setImage] = useState(null);

  const [deleteIndex, setDeleteIndex] = useState("");

  // Load trucks from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("trucks")) || [];
    setTrucks(stored);
  }, []);

  // Save trucks to localStorage and update state
  const saveTrucks = (newTrucks) => {
    localStorage.setItem("trucks", JSON.stringify(newTrucks));
    setTrucks(newTrucks);
  };

  // Add Truck
  const handleAddTruck = () => {
    if (!truckName.trim() || !truckNumber.trim() || !emptyWeight.trim()) {
      return alert("Please fill all fields except image.");
    }

    const entered = prompt("Enter App Password:");
    if (entered !== appPassword) {
      return alert("❌ Incorrect password. Truck not added!");
    }

    const newTruckData = { name: truckName, number: truckNumber, emptyWeight, image: null };

    if (image) {
      const reader = new FileReader();
      reader.onload = () => {
        newTruckData.image = reader.result;
        saveTrucks([...trucks, newTruckData]);
        resetForm();
        alert("✅ Truck added successfully!");
      };
      reader.readAsDataURL(image);
    } else {
      saveTrucks([...trucks, newTruckData]);
      resetForm();
      alert("✅ Truck added successfully!");
    }
  };

  // Delete Truck
  const handleDeleteTruck = () => {
    if (!deleteIndex) return alert("Please select a truck to delete.");

    const entered = prompt("Enter App Password:");
    if (entered !== appPassword) {
      return alert("❌ Incorrect password. Truck not deleted!");
    }

    const updated = trucks.filter((_, idx) => idx !== parseInt(deleteIndex));
    saveTrucks(updated);
    setDeleteIndex("");
    setShowDelete(false);
    alert("✅ Truck deleted successfully!");
  };

  // Reset Add Truck form
  const resetForm = () => {
    setTruckName("");
    setTruckNumber("");
    setEmptyWeight("");
    setImage(null);
    setShowForm(false);
  };

  // Animate and navigate when clicking a truck tile
  const handleTileClick = (route, e) => {
    const target = e.currentTarget;
    target.style.transform = "scale(0.95)";
    setTimeout(() => {
      target.style.transform = "scale(1)";
      navigate(route);
    }, 150);
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
        gap: "30px",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
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
          transition: "0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
      >
        ←
      </button>

      <h1
        className="text-4xl font-bold text-white mt-6 mb-6"
        style={{ color: "white", textAlign: "center", marginBottom: "20px" }}
      >
        🚚 Truck Management
      </h1>

      {/* Truck Tiles Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {trucks.map((truck, index) => (
          <div
            key={index}
            onClick={(e) => handleTileClick("/create-bill", e)}
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6",
              backgroundImage: `url(${truck.image || "/images/truck-icon.png"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "6px 0",
              }}
            >
              {truck.name} | {truck.number}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowDelete(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition active:scale-95"
        >
          {showForm ? "Cancel" : "➕ Add Truck"}
        </button>

        <button
          onClick={() => {
            setShowDelete(!showDelete);
            setShowForm(false);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md transition active:scale-95"
        >
          {showDelete ? "Cancel" : "🗑️ Delete Truck"}
        </button>
      </div>

      {/* Delete Dropdown */}
      {showDelete && (
        <div className="flex flex-col items-center gap-3 bg-white/90 p-4 rounded-lg shadow-lg mb-6">
          <select
            value={deleteIndex}
            onChange={(e) => setDeleteIndex(e.target.value)}
            className="border rounded-lg p-2 w-64"
          >
            <option value="">-- Select Truck to Delete --</option>
            {trucks.map((truck, idx) => (
              <option key={idx} value={idx}>
                {truck.name} ({truck.number})
              </option>
            ))}
          </select>
          <button
            onClick={handleDeleteTruck}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition active:scale-95"
          >
            Confirm Delete
          </button>
        </div>
      )}

      {/* Add Truck Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 md:w-96 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800">Add New Truck</h2>

            <input
              type="text"
              placeholder="Truck Name"
              value={truckName}
              onChange={(e) => setTruckName(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="text"
              placeholder="Truck Number"
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              placeholder="Empty Weight (kg)"
              value={emptyWeight}
              onChange={(e) => setEmptyWeight(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="border rounded-lg p-2"
            />

            <button
              onClick={handleAddTruck}
              className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg shadow-md transition"
            >
              Save Truck
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
