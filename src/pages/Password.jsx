// src/pages/Password.jsx
import React, { useState, useEffect, useContext } from "react";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import emailjs from "@emailjs/browser";
import { AppPasswordContext } from "../App"; // context import
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // optional icon

export default function Password() {
  const { appPassword, setAppPassword } = useContext(AppPasswordContext);
  const navigate = useNavigate();

  const storedPasswordKey = "tirumala_password";
  const defaultPassword = "admin123";
  const adminEmail = "aravindan017@gmail.com";

  const [storedPassword, setStoredPassword] = useState(defaultPassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [changeMessage, setChangeMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [newForgotPassword, setNewForgotPassword] = useState("");
  const [confirmForgotPassword, setConfirmForgotPassword] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Load stored password on mount
  useEffect(() => {
  const loadPassword = async () => {
    try {
      const result = await SecureStoragePlugin.get({ key: storedPasswordKey });
      const loaded = result?.value || defaultPassword;
      setStoredPassword(loaded);
      setAppPassword(loaded);  // update context
      console.log("✅ Loaded stored password into context:", loaded);
    } catch {
      setStoredPassword(defaultPassword);
      setAppPassword(defaultPassword); // fallback
      console.log("⚠️ Failed to load password, using default in context");
    }
  };
  loadPassword();
}, []);

  useEffect(() => {
  console.log("🔑 App context password changed:", appPassword);
}, [appPassword]);

  // Save password to secure storage
  const savePassword = async (password) => {
    try {
      await SecureStoragePlugin.set({ key: storedPasswordKey, value: password });
      setStoredPassword(password);
      console.log("💾 Password saved to secure storage:", password);
      setAppPassword(password);
      console.log("🔑 App context password updated:", password);
    } catch (err) {
      console.error("❌ Failed to save password:", err);
    }
  };

  // Normal password change
  const handleChangePassword = async () => {
    console.log("🔄 Attempting password change");
    if (!newPassword || !confirmPassword) {
      setChangeMessage("❌ New password cannot be empty");
      console.log("❌ New password fields empty");
      return;
    }
    if (currentPassword !== storedPassword) {
      setChangeMessage("❌ Current password incorrect");
      console.log("❌ Current password incorrect");
    } else if (newPassword !== confirmPassword) {
      setChangeMessage("❌ New passwords do not match");
      console.log("❌ New passwords do not match");
    } else {
      await savePassword(newPassword);
      setChangeMessage("");
      setPasswordUpdated(true);
      console.log("✅ Password change successful");
    }
  };

  // Generate & send OTP via EmailJS
  const handleSendOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log("🔢 Generated OTP:", newOtp);

    try {
      await emailjs.send(
        "service_0cpougl",
        "template_zgr5tw5",
        { to_email: adminEmail, otp: newOtp },
        "oCMRLSLAI97bsPmR4"
      );
      setOtpMessage("✅ OTP sent to your email");
      console.log("📧 OTP sent to email:", adminEmail);
    } catch (err) {
      console.error("❌ Failed to send OTP:", err);
      setOtpMessage("❌ Failed to send OTP. Check internet connection.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    console.log("🔍 Verifying OTP", otp, "against", generatedOtp);
    if (!generatedOtp) return;
    if (otp === generatedOtp) {
      setEmailVerified(true);
      setOtpMessage("✅ OTP verified. Enter new password below.");
      console.log("✅ OTP verified");
    } else {
      setOtpMessage("❌ Invalid OTP");
      console.log("❌ OTP invalid");
    }
  };

  // Forgot password after OTP
  const handleForgotSave = async () => {
    console.log("🔄 Saving forgotten password");
    if (!newForgotPassword || !confirmForgotPassword) {
      setOtpMessage("❌ New password cannot be empty");
      console.log("❌ Forgot password fields empty");
      return;
    }
    if (newForgotPassword !== confirmForgotPassword) {
      setOtpMessage("❌ Passwords do not match");
      console.log("❌ Forgot passwords do not match");
    } else {
      await savePassword(newForgotPassword);
      setOtpMessage("");
      setPasswordUpdated(true);
      setShowForgot(false);
      setEmailVerified(false);
      setNewForgotPassword("");
      setConfirmForgotPassword("");
      setOtp("");
      setGeneratedOtp("");
      console.log("✅ Forgotten password updated successfully");
    }
  };

  // Reusable message container
  const MessageBox = ({ message }) => {
    if (!message) return null;
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: "8px 12px",
          borderRadius: "8px",
          color: "#000",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {message}
      </div>
    );
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
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
      }}
    ><button
      onClick={() => navigate(-1)} // go back to previous page
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
        fontSize: window.innerWidth <= 480 ? "18px" : "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
      onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
    >
      <FaArrowLeft /> ←
    </button>
      <h1
        style={{
          color: "#000",
          fontSize: "3rem",
          fontWeight: "bold",
          backgroundColor: "rgba(255,255,255,0.6)",
          padding: "10px 20px",
          borderRadius: "12px",
        }}
      >
        🔑 Password Management
      </h1>

      {passwordUpdated ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <MessageBox message="✅ Password updated successfully!" />
          <button
            onClick={() => (window.location.href = "/")}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}
          >
            Back
          </button>
        </div>
      ) : !showForgot ? (
        <>
          <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); console.log("📝 Current password input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); console.log("📝 New password input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
          <input type="password" placeholder="Re-enter New Password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); console.log("📝 Confirm password input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
          <button onClick={handleChangePassword} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Save Password</button>
          <MessageBox message={changeMessage} />
          <button onClick={() => { setShowForgot(true); console.log("🔄 Switching to Forgot Password flow"); }} style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "#f87171", color: "#fff", cursor: "pointer" }}>Forgot Password?</button>
        </>
      ) : (
        <>
          <MessageBox message={otpMessage} />
          {!emailVerified ? (
            <>
              <button onClick={handleSendOtp} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", marginBottom: "10px" }}>Send OTP to Email</button>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => { setOtp(e.target.value); console.log("📝 OTP input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
              <button onClick={handleVerifyOtp} disabled={!generatedOtp} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: generatedOtp ? "#34d399" : "#9ca3af", color: "#000", cursor: generatedOtp ? "pointer" : "not-allowed", marginTop: "5px" }}>Verify OTP</button>
            </>
          ) : (
            <>
              <input type="password" placeholder="New Password" value={newForgotPassword} onChange={(e) => { setNewForgotPassword(e.target.value); console.log("📝 New forgot password input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
              <input type="password" placeholder="Re-enter New Password" value={confirmForgotPassword} onChange={(e) => { setConfirmForgotPassword(e.target.value); console.log("📝 Confirm forgot password input:", e.target.value); }} style={{ padding: "10px", borderRadius: "8px", width: "250px" }} />
              <button onClick={handleForgotSave} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Save New Password</button>
            </>
          )}
          <button onClick={() => { setShowForgot(false); console.log("🔄 Back to normal password flow"); }} style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "#6b7280", color: "#fff", cursor: "pointer" }}>Back</button>
        </>
      )}
    </div>
  );
}
