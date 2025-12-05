import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const AddVehicle = () => {
  const [vehicles, setVehicles] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [tickets, setTickets] = useState("");
  const [vehicleName, setVehicleName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") return navigate("/login");

    setVehicles(JSON.parse(localStorage.getItem("buses")) || []);
  }, [navigate]);

  const addVehicle = (e) => {
    e.preventDefault();
    const newVehicle = {
      from,
      to,
      date,
      price,
      tickets: Number(tickets),
      vehicleType: vehicleName,
    };

    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    localStorage.setItem("buses", JSON.stringify(updated));

    setFrom("");
    setTo("");
    setDate("");
    setPrice("");
    setTickets("");
    setVehicleName("");
  };

  return (
    <div className="container">
      <h2>Add Ride</h2>

      <form className="form" onSubmit={addVehicle}>
        <input
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
        <input
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price per seat"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Available seats"
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
          required
        />
        <input
          placeholder="Vehicle Type / Name (e.g. Car, Van, Bus)"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          required
        />

        <button type="submit">Add Ride</button>
      </form>
    </div>
  );
};

export default AddVehicle;
