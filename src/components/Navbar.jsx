import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", padding: "12px 24px", background: "#f1f5f9" }}>
      <h2 style={{ marginRight: "24px" }}>Tirumala</h2>
      <Link to="/dashboard" style={{ marginRight: "12px" }}>Dashboard</Link>
      <Link to="/create-bill" style={{ marginRight: "12px" }}>Create Bill</Link>
      <Link to="/trucks" style={{ marginRight: "12px" }}>Trucks</Link>
      <Link to="/mines" style={{ marginRight: "12px" }}>Mines</Link>
      <Link to="/materials" style={{ marginRight: "12px" }}>Materials</Link>
      <Link to="/printer" style={{ marginRight: "12px" }}>Printer</Link>
      <Link to="/history" style={{ marginRight: "12px" }}>History</Link>
    </nav>
  );
}
