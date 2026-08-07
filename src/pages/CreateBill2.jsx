import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Filesystem, Directory } from "@capacitor/filesystem";

const cleanupOldPdfs = async () => {
  try {
    const dir = await Filesystem.readdir({
      directory: Directory.External,
      path: "", // root folder
    });

    for (const file of dir.files) {
      if (file.name && file.name.startsWith("bill_") && file.name.endsWith(".pdf")) {
        await Filesystem.deleteFile({
          path: file.name,
          directory: Directory.External,
        });
        console.log("🗑️ Deleted old bill PDF:", file.name);
      }
    }
  } catch (err) {
    console.log("⚠️ No old PDFs found:", err);
  }
};

export default function CreateBill2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { truck, mine, material } = location.state || {};
  const [emptyWeightInput, setEmptyWeightInput] = useState("");
  const [dacPlaceholder, setDacPlaceholder] = useState("");
  const [generatedDac, setGeneratedDac] = useState(""); // Add at the top
  const [customInput, setCustomInput] = useState(""); // selected input value
const [customInputOptions, setCustomInputOptions] = useState(
  JSON.parse(localStorage.getItem("customInputs")) || []
);
  

  // Mandatory Inputs
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // 12hr format "hh:mm am/pm"
  const [load, setLoad] = useState("");
  const [total, setTotal] = useState(truck?.emptyWeight || 0);
  const [dacNumber, setDacNumber] = useState("");

  // Optional Settings
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [party, setParty] = useState(truck?.name || "");
  const [partyOptions, setPartyOptions] = useState([]);
  const [loading, setLoading] = useState("CRUSHER");
  const [loadingOptions, setLoadingOptions] = useState([]);
  const [unloading, setUnloading] = useState("Party Site");
  const [unloadingOptions, setUnloadingOptions] = useState([]);
  const [transport, setTransport] = useState(truck?.name || "PRM");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
  if (
    (mine?.templateId === "custom1" || mine?.templateId === "custom2") &&
    customInputOptions.length > 0 &&
    !customInput
  ) {
    setCustomInput(customInputOptions[0]);
  }
}, [mine, customInputOptions]);


  // Calculate total
useEffect(() => {
  if (truck) {
    setEmptyWeightInput(truck.emptyWeight || "0");
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  setDate(`${yyyy}-${mm}-${dd}`);

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  const hh = hours.toString().padStart(2, "0");
  setTime(`${hh}:${minutes} ${ampm}`);
}, [truck]);

useEffect(() => {
  if (!date || !time) return;
  if (!manualOverride) {
    const dac = generateDac(date, time);
    setDacPlaceholder(dac);   // show as placeholder
    setGeneratedDac(dac);     // store for final bill
  }
}, [date, time, manualOverride]);


// Calculate total whenever load or emptyWeightInput changes
useEffect(() => {
  const enteredLoad = parseFloat(load) || 0;
  const emptyWeight = parseFloat(emptyWeightInput) || 0;
  setTotal((emptyWeight + enteredLoad).toFixed(2));
}, [load, emptyWeightInput]);

const generateDac = (dateStr, timeStr) => {
  const minDac = 192;
  const maxDac = 8742;

  if (!dateStr || !timeStr) return minDac.toString().padStart(4, "0");

  // --- Parse time ---
  const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return minDac.toString().padStart(4, "0");

  let [_, hourStr, minuteStr, ampm] = match;
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;

  const currentDateTime = new Date(dateStr);
  currentDateTime.setHours(hours, minutes, 0, 0);

  // --- Load last DAC and timestamp ---
  const lastDac = parseInt(localStorage.getItem("lastDac") || minDac, 10);
  const lastDacTimeStr = localStorage.getItem("lastDacTime");
  const lastDacTime = lastDacTimeStr ? new Date(lastDacTimeStr) : new Date(currentDateTime.getTime() - 60 * 60 * 1000);

  let totalIncrement = 0;
  let iterDate = new Date(lastDacTime);

  // --- Configurable ranges ---
  const weekdayMin = 4;
  const weekdayMax = 8;
  const sundayMin = 10;
  const sundayMax = 25;

  while (iterDate < currentDateTime) {
    const nextHour = new Date(iterDate);
    nextHour.setHours(iterDate.getHours() + 1);

    const diffHours = (Math.min(nextHour, currentDateTime) - iterDate) / (1000 * 60 * 60); // fractional hours
    const day = iterDate.getDay();

    let avgTrucks = 0;

    if (day === 0) {
      // Sunday: 10–25 trucks/day
      const sundayTrucks = Math.floor(Math.random() * (sundayMax - sundayMin + 1)) + sundayMin;
      avgTrucks = sundayTrucks / 24;
    } else {
      // Weekday: 4–10 trucks per hour
      avgTrucks = Math.floor(Math.random() * (weekdayMax - weekdayMin + 1)) + weekdayMin;
    }

    totalIncrement += avgTrucks * diffHours;
    iterDate = nextHour;
  }

  const nextDac = Math.min(Math.max(Math.round(lastDac + totalIncrement), minDac), maxDac);

  console.log(
    "Last DAC:", lastDac,
    "Last DAC Time:", lastDacTime.toString(),
    "Current Time:", currentDateTime.toString(),
    "Increment:", totalIncrement.toFixed(2),
    "Next DAC:", nextDac
  );

  return nextDac.toString().padStart(4, "0");
};

 const handleGenerateBill = async () => {
  if (!date || !time || !load) {
    return alert("Please fill all required fields!");
  }

  // Decide DAC
  const finalDac = dacNumber.trim() !== "" ? dacNumber : generatedDac;

  // Cleanup old PDFs
  await cleanupOldPdfs();
  console.log("🧹 Cleaned up old PDFs.");

  // Load stored bills
  const storedBills = JSON.parse(localStorage.getItem("bills")) || [];

  // Check duplicates
  const duplicate = storedBills.find(
    b =>
      b.truck?.id === truck?.id &&
      b.date === date &&
      b.time === time &&
      b.load === load &&
      b.mine?.id === mine?.id
  );
  if (duplicate) return alert("Bill already generated for this truck, mine, date & time.");

  // Parse numbers
  const enteredLoad = parseFloat(load) || 0;
  const emptyWeight = parseFloat(emptyWeightInput) || 0;
  const totalLoad = (enteredLoad + emptyWeight).toFixed(3);
  
  // Construct bill object
  const newBill = {
    truck,
    mine,
    material,
    date,
    time,
    load: enteredLoad.toFixed(3),
    emptyWeight: emptyWeight.toFixed(3),
    total: totalLoad,
    dacNumber: finalDac,
    party,
    loading,
    unloading,
    transport,
    paymentMode,
    customInput: customInput ,
  };

  // Determine generate page
let generatePage = "/generate-bill"; // default

if (mine?.templateId === "custom1") {
  generatePage = "/generate-custom-bill";
} else if (mine?.templateId === "custom2") {
  generatePage = "/generate-custom-bill-2";
} else if (mine?.templateId) {
  switch (mine.templateId) {
    case "mineB":
      generatePage = "/generate-bill-2";
      break;
    case "mineC":
      generatePage = "/generate-bill-3";
      break;
    case "mineD":
      generatePage = "/generate-bill-4";
      break;
    case "mineE":
      generatePage = "/generate-bill-5";
      break;
    case "mineF":
      generatePage = "/generate-bill-6";
      break;
    default:
      generatePage = "/generate-bill";
  }
}

navigate(generatePage, { state: newBill });
};




  if (!truck) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">Error: Truck data missing!</p>
      </div>
    );
  }

  return (
    <div
      className="w-screen min-h-screen flex flex-col items-center bg-cover bg-center overflow-auto"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        padding: "40px",
        gap: "30px",
      }}
    >
      <button
        onClick={() => navigate("/create-bill")}
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

      <div className="flex-1 w-full flex flex-col items-center justify-center px-6 py-12 gap-6">
        {/* Heading */}
        <h1
          className="text-3xl font-bold text-white px-6 py-2 rounded"
          style={{ backgroundColor: "rgba(236, 240, 227, 0.6)" }}
        >
          Enter Date, Time & Load
        </h1>
        {mine?.templateId === "custom1" || mine?.templateId === "custom2" ? (
  <div className="flex flex-col gap-4 w-full max-w-md bg-white/90 p-6 rounded-xl shadow-lg" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>
    <label className="font-bold mb-2 text-lg">Custom Input:</label>
    
    {/* Dropdown */}
  <select
    value={customInput}
    onChange={(e) => setCustomInput(e.target.value)}
    className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none bg-white"
    style={{ color: "#000",backgroundColor: "#cbf6e8ff" }}
  >
    {customInputOptions.map((opt, idx) => (
      <option key={idx} value={opt}>
        {opt}
      </option>
    ))}
  </select>

    {/* Buttons */}
    <div className="flex gap-2 mt-2">
      <button
        type="button"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        style={{ marginRight: "10px",color: "white",backgroundColor: "#33e4e4ff" }}
        onClick={() => {
          const newVal = prompt("Enter new custom value:");
          if (newVal && !customInputOptions.includes(newVal)) {
            const updated = [...customInputOptions, newVal];
            setCustomInputOptions(updated);
            localStorage.setItem("customInputs", JSON.stringify(updated));
          }
        }}
      >
        Add
      </button>

      <button
        type="button"
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        style={{ marginRight: "10px",color: "white",backgroundColor: "#ed6161ff" }}
        onClick={() => {
          if (!customInput) return alert("Select a value to delete!");
          const updated = customInputOptions.filter(opt => opt !== customInput);
          setCustomInputOptions(updated);
          setCustomInput(""); // clear selection
          localStorage.setItem("customInputs", JSON.stringify(updated));
        }}
      >
        Delete
      </button>
    </div>
  </div>
) : (
  <>
    {/* existing standard inputs: date, time, load, empty weight, DAC, total */}
  </>
)}

        {/* Inputs Container */}
        <div className="flex flex-col gap-4 w-full max-w-md bg-white/90 p-6 rounded-xl shadow-lg">
          {/* Date */}
          <div
            className="flex flex-col"
            style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#13a6d3ff", color: "#fff" }}
          >
            <label className="font-bold mb-1">Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Time */}
<div
  className="flex flex-col items-center"
  style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#0dddb0ff", color: "#fff" }}
>
  <label className="font-bold mb-2">Select Time:</label>
  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 bg-white rounded-xl px-3 py-2">
    
    {/* Hours */}
    <select
      value={time.split(":")[0]} // hour
      onChange={(e) => {
        const hour = e.target.value;
        const minute = (time.split(":")[1] || "00").split(" ")[0];
        const ampm = time.split(" ")[1];
        setTime(`${hour}:${minute} ${ampm}`);
      }}
      className="bg-transparent text-2xl font-bold focus:outline-none cursor-pointer"
    >
      {Array.from({ length: 12 }, (_, i) => ((i + 1).toString().padStart(2, "0"))).map((val) => (
        <option key={val} value={val}>{val}</option>
      ))}
    </select>

    :

    {/* Minutes */}
    <select
      value={(time.split(":")[1] || "00").split(" ")[0]}
      onChange={(e) => {
        const hour = time.split(":")[0];
        const minute = e.target.value;
        const ampm = time.split(" ")[1];
        setTime(`${hour}:${minute} ${ampm}`);
      }}
      className="bg-transparent text-2xl font-bold focus:outline-none cursor-pointer"
    >
      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((val) => (
        <option key={val} value={val}>{val}</option>
      ))}
    </select>

    {/* AM/PM */}
    <select
      value={time.split(" ")[1]} // am or pm
      onChange={(e) => {
        const hour = time.split(":")[0];
        const minute = (time.split(":")[1] || "00").split(" ")[0];
        setTime(`${hour}:${minute} ${e.target.value}`);
      }}
      className="ml-2 bg-blue-500 text-white text-lg rounded-lg px-3 py-1 cursor-pointer hover:bg-blue-600"
    >
      <option value="am">AM</option>
      <option value="pm">PM</option>
    </select>

  </div>
</div>
          {/* Load */}
          <div className="flex flex-col" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>
            <label className="font-bold mb-1">Load (kg):</label>
            <input
              type="number"
              step="0.001"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              placeholder="Enter load"
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
           {/* Total */}
          <div className="font-bold text-xl text-center" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "rgb(243, 243, 243)", color: "#080808ff" }}>
            Total Load:<span style={{fontWeight:"700"}}> {total} MT</span>
          </div>
          {/* Empty Weight */}
  <div className="flex flex-col" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>
    <label className="font-bold mb-1">Empty (kg):</label>
  <input
    type="number"
    value={emptyWeightInput}
    onChange={(e) => setEmptyWeightInput(e.target.value)}
    className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
  />

  {/* Arrow buttons */}
  <div className="flex flex-col">
    <button
      type="button"
      onClick={() =>
        setEmptyWeightInput((prev) => {
          const [intPart, decPart] = (parseFloat(prev) || 0).toFixed(3).split(".");
          let newDec = parseInt(decPart) + 10; // increase by 0.001
          if (newDec > 999) newDec = 999; // clamp
          return `${intPart}.${newDec.toString().padStart(3, "0")}`;
        })
      }
      className="bg-blue-500 text-white px-2 rounded "
      style={{ height: "30px",width: "30px",position: "relative", left: "80%", bottom: "35px",marginTop: "5px" ,backgroundColor: "transparent"}}
    >
      ▲
    </button>
    <button
      type="button"
      
      onClick={() =>
        setEmptyWeightInput((prev) => {
          const [intPart, decPart] = (parseFloat(prev) || 0).toFixed(3).split(".");
          let newDec = parseInt(decPart) - 10; // decrease by 0.001
          if (newDec < 0) newDec = 0;
          return `${intPart}.${newDec.toString().padStart(3, "0")}`;
        })
      }
      className="bg-blue-500 text-white px-2 rounded mt-1 "
      style={{ height: "30px",width: "30px",position: "relative", left: "80%", bottom: "35px",marginTop: "5px",backgroundColor: "transparent" }}
    >
      ▼
    </button>
  </div>
</div>

          {/* DAC */}
          <div className="flex flex-col" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>
            <label className="font-bold mb-1">DAC/Ref Number (optional):</label>
                        <input
              type="number"
              value={dacNumber}
              onChange={(e) => {
                const val = e.target.value;
                setDacNumber(val);
                setManualOverride(val !== ""); // user typed, freeze auto mode
              }}
              placeholder={dacPlaceholder} // shows generated DAC as placeholder
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

         

          {/* Buttons */}
          <div className="flex justify-between w-full mt-6">
            <button
            type="button"
              onClick={handleGenerateBill}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!load}
            >
              Generate Bill
            </button>
            <button
              type="button"
              onClick={() => setShowMoreSettings(!showMoreSettings)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {showMoreSettings ? "Hide Settings" : "More Settings"}
            </button>
          </div>

          {/* Optional Inputs */}
          {showMoreSettings && (
  <div className="flex flex-col gap-4 w-full max-w-md mt-4">
    {/* Party Tile */}
    {/* Party Tile */}
    <div className="flex items-center h-20 bg-gray-300 rounded-xl shadow-md p-3 gap-3">
      <span className="font-bold text-xl bg-blue-400 text-white px-4 py-2 rounded"
      style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>
        Party
      </span>
      <select
        value={party}
        onChange={(e) => setParty(e.target.value)}
        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#8eed97ff", color: "#030202ff" }}
        
      >
        <option value={truck?.name}>{truck?.name}</option>
        {partyOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
      </select>
      <button
        onClick={() => {
          const newVal = prompt("Enter new Party name:");
          if (newVal) setPartyOptions([...partyOptions, newVal]);
        }}
        className="px-2 bg-green-500 text-white rounded"
        
      >
        +
      </button>
      <button
        onClick={() => {
          setPartyOptions(partyOptions.filter((opt) => opt !== party));
          setParty(truck?.name || "");
        }}
        className="px-2 bg-red-500 text-white rounded"
      >
        ×
      </button>
    </div>
    <br/>

    {/* Loading Tile */}
    <div className="relative flex items-center justify-center h-20 bg-gray-300 rounded-xl shadow-md p-3">
      <span className="font-bold text-xl text-center" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>Loading</span>
      <select
        value={loading}
        onChange={(e) => setLoading(e.target.value)}
        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#8eed97ff", color: "#030202ff" }}
      >
        <option value="CRUSHER">CRUSHER</option>
        <option value="Quarry">Quarry</option>
        {loadingOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
      </select>
      <button
        onClick={() => {
          const newVal = prompt("Enter new Loading option:");
          if (newVal) setLoadingOptions([...loadingOptions, newVal]);
        }}
        className="px-2 bg-green-500 text-white rounded ml-2"
      >
        +
      </button>
      <button
        onClick={() => {
          setLoadingOptions(loadingOptions.filter((opt) => opt !== loading));
          setLoading("CRUSHER");
        }}
        className="px-2 bg-red-500 text-white rounded ml-1"
      >
        ×
      </button>
    </div>
    <br/>

    {/* Unloading Tile */}
    <div className="relative flex items-center justify-center h-20 bg-gray-300 rounded-xl shadow-md p-3">
      <span  className="font-bold text-xl text-center" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>Unloading</span>
      <select
        value={unloading}
        onChange={(e) => setUnloading(e.target.value)}
        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#8eed97ff", color: "#030202ff" }}
      >
        <option value="Party Site">Party Site</option>
        {unloadingOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
      </select>
      <button
        onClick={() => {
          const newVal = prompt("Enter new Unloading option:");
          if (newVal) setUnloadingOptions([...unloadingOptions, newVal]);
        }}
        className="px-2 bg-green-500 text-white rounded ml-2"
      >
        +
      </button>
      <button
        onClick={() => {
          setUnloadingOptions(unloadingOptions.filter((opt) => opt !== unloading));
          setUnloading("Party Site");
        }}
        className="px-2 bg-red-500 text-white rounded ml-1"
      >
        ×
      </button>
    </div>
    
    <br/>

    {/* Transport Tile */}
    <div className="relative flex items-center justify-center h-20 bg-gray-300 rounded-xl shadow-md p-3">
      <span  className="font-bold text-xl text-center" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>Transport</span>
      <input
        value={transport}
        onChange={(e) => setTransport(e.target.value)}
        placeholder="Transport"
        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#8eed97ff", color: "#030202ff" }}
      />
    </div>
    <br/>
    

    {/* Payment Mode Tile */}
    <div className="relative flex items-center justify-center h-20 bg-gray-300 rounded-xl shadow-md p-3">
      <span className="font-bold text-xl text-center" style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#60a5fa", color: "#fff" }}>Payment Mode</span>
      <select
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
        className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", background: "#8eed97ff", color: "#030202ff" }}
      >
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Credit">Credit</option>
      </select>
    </div>
    <hr/>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
