import React, { createContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin"

// Pages
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import CreateBill from "./pages/CreateBill";
import CreateBill2 from "./pages/CreateBill2";
import Trucks from "./pages/Trucks";
import GenerateBill from "./pages/GenerateBill"; 
import GenerateBill2 from "./pages/GenerateBill2";  
import GenerateBill3 from "./pages/GenerateBill3";
import GenerateBill4 from "./pages/GenerateBill4";
import GenerateBill5 from "./pages/GenerateBill5";
import GenerateBill6 from "./pages/GenerateBill6";
import Mines from "./pages/Mines";
import Materials from "./pages/Materials";
import Printer from "./pages/Printer";
import Printer2 from "./pages/Printer2";
import History from "./pages/History";
import Password from "./pages/Password"; 
import GenerateCustomBill from "./pages/GenerateCustomBill";
import GenerateCustomBill2 from "./pages/GenerateCustomBill2";
export const AppPasswordContext = createContext();

export default function App() {
  const [appPassword, setAppPassword] = useState(null); // start as null
  const storedPasswordKey = "tirumala_password";
  const defaultPassword = "admin123";
  useEffect(() => {
    const loadPassword = async () => {
      try {
        const result = await SecureStoragePlugin.get({ key: storedPasswordKey });
        const loadedPassword = result?.value || defaultPassword;
        setAppPassword(loadedPassword);
        console.log("✅ App context password initialized:", loadedPassword);
      } catch (err) {
        setAppPassword(defaultPassword);
        console.log("⚠️ Failed to load password, using default:", defaultPassword);
      }
    };
    loadPassword();
  }, []);

  // Don't render children until password is loaded
  if (appPassword === null) {
    return <div>Loading...</div>;
  }

  return (
    <AppPasswordContext.Provider value={{ appPassword, setAppPassword }}>
      <div className="min-h-screen w-full flex flex-col bg-gray-100">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-bill" element={<CreateBill />} />
          <Route path="/create-bill-2" element={<CreateBill2 />} />
          <Route path="/generate-bill" element={<GenerateBill />} />
          <Route path="/generate-bill-2" element={<GenerateBill2 />} />
          <Route path="/generate-bill-3" element={<GenerateBill3 />} />
          <Route path="/generate-bill-4" element={<GenerateBill4 />} />
          <Route path="/generate-bill-5" element={<GenerateBill5 />} />
          <Route path="/generate-bill-6" element={<GenerateBill6 />} />
          <Route path="/generate-custom-bill" element={<GenerateCustomBill />} />
          <Route path="/generate-custom-bill-2" element={<GenerateCustomBill2 />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/mines" element={<Mines />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/printer" element={<Printer />} />
          <Route path="/printer2" element={<Printer2 />} />
          <Route path="/history" element={<History />} />
          <Route path="/password" element={<Password />} />
        </Routes>
      </div>
    </AppPasswordContext.Provider>
  );
}
