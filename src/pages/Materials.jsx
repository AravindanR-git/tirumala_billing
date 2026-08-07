import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Materials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultMaterialIcon = "🪨"; // default icon for materials

  // Load materials from localStorage
  useEffect(() => {
    const storedMaterials = JSON.parse(localStorage.getItem("materials")) || [];
    setMaterials(storedMaterials);
  }, []);

  // Save materials to localStorage
  const saveMaterials = (newMaterials) => {
    localStorage.setItem("materials", JSON.stringify(newMaterials));
    setMaterials(newMaterials);
  };

  const handleAddMaterial = () => {
    if (!name) {
      alert("Please enter material name");
      return;
    }

    const reader = new FileReader();
    if (image) {
      reader.onload = () => {
        const newMaterial = { name, image: reader.result };
        saveMaterials([...materials, newMaterial]);
        resetForm();
      };
      reader.readAsDataURL(image);
    } else {
      const newMaterial = { name, image: null };
      saveMaterials([...materials, newMaterial]);
      resetForm();
    }
  };

  const handleDeleteMaterial = (index) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      const newMaterials = [...materials];
      newMaterials.splice(index, 1);
      saveMaterials(newMaterials);
    }
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setShowAddForm(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/images/materials-bg.jpg')",
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

      <h1 style={{ color: "#000000ff", textAlign: "center", marginBottom: "20px" }}>Material Management</h1>

      {/* Material Tiles */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {materials.map((material, idx) => (
          <div
            key={idx}
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
              backgroundImage: material.image
                ? `url(${material.image})`
                : `url('/images/material-logo.png')`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
          >
            {/* Title Container */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "100%",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                padding: "5px 0",
              }}
            >
              {material.name}
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMaterial(idx);
              }}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                padding: "5px 8px",
                borderRadius: "6px",
                border: "none",
                background: "#f87171",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* Add Material Toggle */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#60a5fa",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {showAddForm ? "Cancel" : "Add Material"}
      </button>

      {/* Add Material Form */}
      {showAddForm && (
        <div
          style={{
            marginTop: "20px",
            background: "#f3f4f6",
            padding: "20px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: "300px",
          }}
        >
          <input
            type="text"
            placeholder="Material Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ padding: "8px" }}
          />
          <button
            onClick={handleAddMaterial}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#34d399",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save Material
          </button>
        </div>
      )}
    </div>
  );
}
