// src/pages/Mines.jsx
import { color } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Mines() {
  const navigate = useNavigate();
  const [mines, setMines] = useState([]); // ✅ Added state

  // ✅ Permanent Mines
  const permanentMines = [
    {
      id: 1,
      name: "Quarry A",
      icon: "/images/mines-logo.jpg",
      templateId: "mineA",
      permanent: true,
    },
    {
      id: 2,
      name: "MINE B",
      icon: "/images/mines-logo.jpg",
      templateId: "mineB",
      permanent: true,
    },
    {
      id: 3,
      name: "MINE C",
      icon: "/images/mines-logo.jpg",
      templateId: "mineC",
      permanent: true,
    },
    {
      id: 4,
      name: "KMS",
      icon: "/images/kms-logo.jpg",
      templateId: "mineD",
      permanent: true,
    },
    {
      id: 5,
      name: "MINE E",
      icon: "/images/mines-bg.jpeg",
      templateId: "mineE",
      permanent: true,
    },
    {
      id: 6,
      name: "MINE F",
      icon: "/images/mines-bg.jpeg",
      templateId: "mineF",
      permanent: true,
    },
     { id: 7, name: "CUSTOM MINE 1", icon: "/images/mines-bg.jpeg", templateId: "custom1", permanent: true },
  { id: 8, name: "CUSTOM MINE 2", icon: "/images/mines-bg.jpeg", templateId: "custom2", permanent: true },
  ];

  // Load mines from localStorage or initialize
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mines") || "[]");
    if (stored.length === 0) {
      localStorage.setItem("mines", JSON.stringify(permanentMines));
      setMines(permanentMines);
    } else {
      setMines(stored);
    }
  }, []);

  // Tile styles
  const tileStyles = {
    width: "180px",
    height: "180px",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    cursor: "default",
  };

  const labelStyles = {
    position: "absolute",
    bottom: "30px",
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "6px 0",
  };

  const buttonStyles = {
    position: "absolute",
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 8px",
    fontSize: "0.8rem",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/mines-bg.jpeg')",
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
      {/* Back button */}
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
      <h1 className="text-4xl font-bold text-white mt-6 mb-6" style={{ color: "#ffffffff" }}
       >
        ⛏️ Mine Management
      </h1>

      {/* Mines Tiles Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {mines.map((mine) => (
          <div
            key={mine.id}
            style={{
              ...tileStyles,
              backgroundImage: `url(${mine.icon})`,
            }}
          >
            <div style={labelStyles}>{mine.name}</div>
            

            
            {/* Preview Button */}
<button
  style={buttonStyles}
  onClick={() => {
    const getGeneratePage = (templateId) => {
      switch (templateId) {
        case "mineA":
          return "/generate-bill";
        case "mineB":
          return "/generate-bill-2";
        case "mineC":
          return "/generate-bill-3";
        case "mineD":
          return "/generate-bill-4";
        case "mineE":
          return "/generate-bill-5";
        case "mineF":
          return "/generate-bill-6";
        case "custom1":
          return "/generate-custom-bill";
        case "custom2":
          return "/generate-custom-bill-2";
        default:
          return "/generate-bill";
      }
    };
    


    navigate(getGeneratePage(mine.templateId), {
      state: {
        truck: { number: "TR-001", emptyWeight: 0 },
        mine: mine,
        material: { name: "Sample Material" },
        date: new Date().toISOString().split("T")[0],
        time: "12:00 PM",
        load: 10,
        total: 10,
        dacNumber: 1234,
      },
    });
  }}
>
  Preview Bill
</button>

          </div>
        ))}
      </div>
      <div
 
>
 
</div>
    </div>
  );
}
