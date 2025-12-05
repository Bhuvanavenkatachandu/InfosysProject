import { useEffect, useState } from "react";
import { verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);

    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }

    const all = JSON.parse(localStorage.getItem("bookings")) || [];
    const mine = all.filter((b) => b.userEmail === user.email);
    setBookings(mine);
  }, [navigate]);

  return (
    <div className="container">
      <h2>My Bookings</h2>

      <table>
        <thead>
          <tr>
            <th>From</th><th>To</th><th>Date</th>
            <th>Vehicle</th><th>Seats</th><th>Passengers</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b, i) => (
            <tr key={i}>
              <td>{b.bus.from}</td>
              <td>{b.bus.to}</td>
              <td>{b.bus.date}</td>
              <td>{b.bus.vehicleType}</td>
              <td>{b.seats}</td>
              <td>{(b.passengerNames || []).join(", ")}</td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan="6">No bookings yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserBookings;
