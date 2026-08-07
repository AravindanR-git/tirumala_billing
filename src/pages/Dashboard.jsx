import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const options = [
    { name: "Trucks", icon: "🚛", route: "/trucks" },
    { name: "Mines", icon: "⛏️", route: "/mines" },
    { name: "Materials", icon: "📦", route: "/materials" },
    { name: "Printer", icon: "🖨️", route: "/printer" },
    { name: "History", icon: "📜", route: "/history" },
   
  ];

  const handleTileClick = (route, e) => {
    const target = e.currentTarget;
    target.style.transform = "scale(0.95)";
    setTimeout(() => {
      target.style.transform = "scale(1)";
      navigate(route);
    }, 150);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundImage: "url('/images/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          gap: "40px",
        }}
      >
        {/* Create Bill tile */}
        <div
          onClick={(e) => handleTileClick("/create-bill", e)}
          style={{
            cursor: "pointer",
            padding: "30px 50px",
            borderRadius: "16px",
            background: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "200px",
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
          <div style={{ fontSize: "48px" }}>🧾</div>
          Create Bill
        </div>

        {/* Other tiles */}
        <div
          className="tiles-container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            justifyItems: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={(e) => handleTileClick(opt.route, e)}
              style={{
                cursor: "pointer",
                padding: "20px",
                borderRadius: "12px",
                background: "#f3f4f6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "140px",
                height: "140px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: "48px" }}>{opt.icon}</div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                {opt.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* responsive behavior via CSS */}
      <style>
        {`
          @media (min-width: 768px) {
            .tiles-container {
              display: flex !important;
              flex-direction: row;
              justify-content: center;
              flex-wrap: wrap;
              gap: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}
