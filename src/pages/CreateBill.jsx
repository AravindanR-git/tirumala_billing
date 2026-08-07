// src/pages/CreateBill.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CreateBill() {
  const navigate = useNavigate();

  const [step, setStep] = useState("truck"); // truck, mine, material
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedMine, setSelectedMine] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [trucks, setTrucks] = useState([]);
  const [mines, setMines] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    setTrucks(JSON.parse(localStorage.getItem("trucks")) || []);
    setMines(JSON.parse(localStorage.getItem("mines")) || []);
    setMaterials(JSON.parse(localStorage.getItem("materials")) || []);
  }, []);

  const handleSelect = (item) => {
    if (step === "truck") {
      setSelectedTruck(item);
      setStep("mine");
    } else if (step === "mine") {
      setSelectedMine(item);
      setStep("material");
    } else if (step === "material") {
      setSelectedMaterial(item);
      navigate("/create-bill-2", {
        state: { truck: selectedTruck, mine: selectedMine, material: item },
      });
    }
  };

  const renderTiles = (items, type) => {
  const defaultImages = {
    truck: "/images/truck-icon.png",
    mine: "/images/mine-icon.png",
    material: "/images/material-icon.png",
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
      }}
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          onClick={() => handleSelect(item)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
            backgroundImage: `url(${
  type === "material"
    ? item.image || '/images/material-logo.png'
    : type === "mine"
      ? item.icon || defaultImages[type]
      : item.image || defaultImages[type]
})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* Title on tiles */}
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
            {type === "truck" ? `${item.name} | ${item.number}` : item.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

  const titles = {
    truck: "Select Truck",
    mine: "Select Mine",
    material: "Select Material",
  };

  return (
    <div
      className="w-screen min-h-screen flex flex-col items-center bg-cover bg-center overflow-auto"
      style={{
        backgroundImage: "url('/images/background.jpg')", // NOTE: change later if needed
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // stretch to viewport
        padding: "40px",
        gap: "30px",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700 transition"
      >
        ←
      </button>

      {/* Title */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        {titles[step]}
      </div>

      {/* Tiles */}
      {step === "truck" && renderTiles(trucks, "truck")}
      {step === "mine" && renderTiles(mines, "mine")}
      {step === "material" && renderTiles(materials, "material")}
    </div>
  );
}
