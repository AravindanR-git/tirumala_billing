// src/pages/Printer2.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppPasswordContext } from "../App";
import { File } from "@awesome-cordova-plugins/file";
import { FileOpener } from "@awesome-cordova-plugins/file-opener";

export default function Printer2() {
  const navigate = useNavigate();
  const { appPassword } = useContext(AppPasswordContext);

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  const handleAuth = () => {
    if (password === appPassword) {
      setAuthenticated(true);
      setAuthFailed(false);
      setPassword("");
    } else {
      setAuthFailed(true);
      setPassword("");
    }
  };

  const handleOpenAPK = async () => {
  try {
    // APK path inside Android assets
    const apkPath = "file:///android_asset/public/apks/rawbt-mod.apk";

    // Open APK directly
    await FileOpener.open(apkPath, "application/vnd.android.package-archive");

    console.log("✅ APK opened successfully!");
  } catch (err) {
    console.error("❌ Failed to open APK:", err);
    alert(
      "Failed to open APK. Make sure this is running on a real Android device, not in browser."
    );
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
        }}
      >
        ←
      </button>

      <h1 style={{ color: "#fff", fontSize: "3rem", fontWeight: "bold" }}>
        🖨️ Printer Setup
      </h1>

      {authenticated ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleOpenAPK}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#34d399",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Open APK
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          {authFailed && <div style={{ fontSize: "5rem", color: "#f87171" }}>⚠️</div>}
          <input
            type="password"
            placeholder={authFailed ? "Authentication Failed" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              width: "250px",
              backgroundColor: authFailed ? "#fca5a5" : "white",
            }}
          />
          <button
            onClick={authFailed ? () => setAuthFailed(false) : handleAuth}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: authFailed ? "#f87171" : "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {authFailed ? "Try Again" : "Authenticate"}
          </button>
        </div>
      )}
    </div>
  );
}
