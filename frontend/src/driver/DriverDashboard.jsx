import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { apiFetch, verifyJWT } from "../utils/jwt";

const DriverDashboard = () => {
    const nav = useNavigate();
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);

    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });

    const [myRides, setMyRides] = useState([]);
    const [loadingRides, setLoadingRides] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [searchText, setSearchText] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    // WebSocket Connection
    useEffect(() => {
        if (!user || user.role !== "driver") return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8084/ws"),
            onConnect: () => {
                client.subscribe("/topic/driver/" + user.email, (msg) => {
                    alert("🔔 " + msg.body);
                    fetchBookings();
                });
            },
            onStompError: (err) => console.error("WebSocket Error:", err),
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    // Derived state for filtering and sorting
    const filteredBookings = bookings
        .filter(b => {
            const name = b.passengers && b.passengers.length > 0 ? b.passengers[0].name : "Unknown";
            return name.toLowerCase().includes(searchText.toLowerCase()) ||
                b.userEmail.toLowerCase().includes(searchText.toLowerCase());
        })
        .sort((a, b) => {
            const dateA = new Date(a.vehicle?.date || 0);
            const dateB = new Date(b.vehicle?.date || 0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    const toggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");

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

        // Fetch my posted rides
        setLoadingRides(true);
        setErrorMsg("");
        apiFetch("/api/vehicles/driver-posts")
            .then(data => setMyRides(data))
            .catch(err => {
                console.error(err);
                setErrorMsg(err.message || "Failed to load rides");
            })
            .finally(() => setLoadingRides(false));
    };

    useEffect(() => { fetchBookings(); }, []);

    const fetchRequests = async () => {
        try {
            const data = await apiFetch("/api/bookings/driver");
            setBookings(data);
        } catch { setBookings([]); }
    };

    // handleReserve removed in favor of page navigation

    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    // Auto-clear message after 3 seconds
    useEffect(() => {
        if (statusMsg.text) {
            const timer = setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const updateStatus = async (id, status) => {
        try {
            await apiFetch(`/api/bookings/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            setStatusMsg({ type: "success", text: `Booking ${status.toLowerCase()}!` });
            fetchBookings(); // Refresh
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message });
        }
    };

    return (
        <div className="container mt-4">
            <h2>Driver Dashboard</h2>

            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type === "error" ? "danger" : "success"} mb-4`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-8 fade-in">
                <div className="card text-center hover:shadow-lg transition">
                    <h3 className="text-primary">{stats.total}</h3>
                    <p className="text-muted font-bold">Total Requests</p>
                </div>
                <div className="card text-center hover:shadow-lg transition">
                    <h3 className="text-warning">{stats.pending}</h3>
                    <p className="text-muted font-bold">Pending</p>
                </div>
                <div className="card text-center hover:shadow-lg transition">
                    <h3 className="text-success">{stats.confirmed}</h3>
                    <p className="text-muted font-bold">Confirmed</p>
                </div>
            </div>

            <div className="card mb-8 fade-in">
                <h3>My Posted Rides</h3>
                <div className="table-container">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>From - To</th>
                                <th>Date</th>
                                <th>Price</th>
                                <th>Seats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errorMsg && <tr><td colSpan="5" className="text-center text-danger">{errorMsg}</td></tr>}
                            {loadingRides && <tr><td colSpan="5" className="text-center">Loading rides...</td></tr>}
                            {!loadingRides && !errorMsg && myRides.length === 0 && <tr><td colSpan="5" className="text-center">No rides posted yet</td></tr>}
                            {!loadingRides && !errorMsg && myRides.map(r => (
                                <tr key={r.id}>
                                    <td>{r.fromLocation} &rarr; {r.toLocation}</td>
                                    <td>{r.date}</td>
                                    <td>{r.price}</td>
                                    <td>{r.tickets}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning" onClick={() => nav(`/driver/reserve/${r.id}`)}>Reserve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3>Booking Requests</h3>
                <div className="flex gap-2">
                    <input
                        className="input"
                        style={{ width: '250px', padding: '6px 12px' }}
                        placeholder="Search passenger or email..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <button className="btn btn-sm btn-primary" onClick={toggleSort}>
                        Sort Date {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="table-container fade-in">
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
                        {filteredBookings.length === 0 && <tr><td colSpan="6" className="text-center">No bookings found</td></tr>}
                        {filteredBookings.map(b => (
                            <tr key={b.id}>
                                <td>{b.userEmail}<br /><small className="text-muted">{b.passengers?.map(p => `${p.name} (${p.age}, ${p.gender})`).join(", ")}</small></td>
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
                                    {b.status === "CONFIRMED" && (
                                        <span></span>
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
