import { useEffect, useState } from "react";
import { verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const UserBus = () => {
  const [buses, setBuses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);

    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }

    const storedBuses = JSON.parse(localStorage.getItem("buses")) || [];
    setBuses(storedBuses);
  }, [navigate]);

  const goToBooking = (busIndex) => {
    navigate(`/book/${busIndex}`);
  };

  return (
    <div className="container">
      <h2>Available Rides</h2>

      <table>
        <thead>
          <tr>
            <th>From</th><th>To</th><th>Date</th>
            <th>Vehicle</th><th>Price</th><th>Seats Left</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {buses.map((b, i) => (
            <tr key={i}>
              <td>{b.from}</td>
              <td>{b.to}</td>
              <td>{b.date}</td>
              <td>{b.vehicleType}</td>
              <td>{b.price}</td>
              <td>{b.tickets}</td>
              <td>
                <button
                  onClick={() => goToBooking(i)}
                  style={{ background: "green", color: "white", padding: "5px 10px" }}
                >
                  Book
                </button>
              </td>
            </tr>
          ))}
          {buses.length === 0 && (
            <tr>
              <td colSpan="7">No rides available right now.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserBus;
