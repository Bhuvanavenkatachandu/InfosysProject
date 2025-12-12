import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";

const DriverDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });

    const fetchBookings = () => {
        apiFetch("/api/bookings/driver")
            .then(data => {
                setBookings(data);
                const total = data.length;
                const pending = data.filter(b => b.status === "PENDING").length;
                const confirmed = data.filter(b => b.status === "CONFIRMED").length;
                setStats({ total, pending, confirmed });
            })
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await apiFetch(`/api/bookings/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            fetchBookings(); // Refresh
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="container mt-4">
            <h2>Driver Dashboard</h2>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="card text-center">
                    <h3>{stats.total}</h3>
                    <p className="text-muted">Total Requests</p>
                </div>
                <div className="card text-center">
                    <h3>{stats.pending}</h3>
                    <p className="text-muted">Pending</p>
                </div>
                <div className="card text-center">
                    <h3>{stats.confirmed}</h3>
                    <p className="text-muted">Confirmed</p>
                </div>
            </div>

            <div className="table-container">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Passenger</th>
                            <th>Ride (From-To)</th>
                            <th>Date</th>
                            <th>Seats</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 && <tr><td colspan="6" className="text-center">No bookings yet</td></tr>}
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>{b.userEmail}<br /><small className="text-muted">{b.passengerNames?.join(", ")}</small></td>
                                <td>{b.vehicle?.fromLocation} &rarr; {b.vehicle?.toLocation}</td>
                                <td>{b.vehicle?.date}</td>
                                <td>{b.seats}</td>
                                <td>
                                    <span className={`badge ${b.status === "CONFIRMED" ? "success" : b.status === "PENDING" ? "warning" : "error"}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>
                                    {b.status === "PENDING" && (
                                        <div className="flex gap-1">
                                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(b.id, "CONFIRMED")}>Accept</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b.id, "REJECTED")}>Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriverDashboard;
