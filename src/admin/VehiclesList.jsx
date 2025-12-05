import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") return navigate("/login");

    setVehicles(JSON.parse(localStorage.getItem("buses")) || []);
  }, [navigate]);

  const removeVehicle = (index) => {
    const updated = vehicles.filter((_, i) => i !== index);
    setVehicles(updated);
    localStorage.setItem("buses", JSON.stringify(updated));
  };

  return (
    <div className="container">
      <h2>All Rides / Vehicles</h2>
      <table>
        <thead>
          <tr>
            <th>From</th><th>To</th><th>Date</th>
            <th>Vehicle</th><th>Price</th><th>Seats</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v, i) => (
            <tr key={i}>
              <td>{v.from}</td>
              <td>{v.to}</td>
              <td>{v.date}</td>
              <td>{v.vehicleType}</td>
              <td>{v.price}</td>
              <td>{v.tickets}</td>
              <td>
                <button
                  onClick={() => removeVehicle(i)}
                  style={{ background: "red", color: "white" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {vehicles.length === 0 && (
            <tr>
              <td colSpan="7">No rides posted yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehiclesList;
