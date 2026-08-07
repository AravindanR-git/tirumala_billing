import React from "react";
import { useNavigate } from "react-router-dom";

export default function Printer() {
  const navigate = useNavigate();

  const options = [
    { name: "Printer Setup", icon: "🖨️", route: "/printer2" },
    { name: "Password", icon: "🔑", route: "/password" },
  ];

  const handleTileClick = (route) => {
    navigate(route);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/background.jpg')", // same as History page
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        gap: "40px",
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
        }}
      >
        ←
      </button>

      <h1 style={{ color: "#fff", fontSize: "3rem", fontWeight: "bold" }}>
        Printer
      </h1>

      {/* Tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          justifyItems: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {options.map((opt, idx) => (
          <div
            key={idx}
            onClick={() => handleTileClick(opt.route)}
            style={{
              cursor: "pointer",
              padding: "30px",
              borderRadius: "16px",
              background: "rgba(243,244,246,0.9)", // slightly transparent to see background
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "200px",
              height: "200px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
            }}
          >
            <div style={{ fontSize: "64px" }}>{opt.icon}</div>
            {opt.name}
          </div>
        ))}
      </div>
    </div>
  );
}
