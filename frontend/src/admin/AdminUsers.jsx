// src/admin/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // load users from backend
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users");
      if (err.status === 401 || err.status === 403) {
        // if unauthorized, go to login
        navigate("/login");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // client-side quick guard: verify token and role
    const token = getToken();
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleEdit = async (id, currentRole) => {
    const name = prompt("New name:");
    const email = prompt("New email:");
    const role = prompt("New role (user/driver/admin):", currentRole);
    if (!name || !email || !role) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, role }),
      });
      await loadUsers();
      alert("User updated.");
    } catch (err) {
      console.error("Edit failed:", err);
      alert(err.message || "Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      await loadUsers();
      alert("User deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete user");
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}/approve`, { method: "POST" });
      await loadUsers();
      alert("User approved as admin.");
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err.message || "Failed to approve user");
    }
  };

  const handleRevoke = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}/revoke`, { method: "POST" });
      await loadUsers();
      alert("Admin rights revoked.");
    } catch (err) {
      console.error("Revoke failed:", err);
      alert(err.message || "Failed to revoke admin");
    }
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Registered Users</h2>
        <span className="badge primary">{users.length} Users</span>
      </div>

      {loading && <p>Loading users…</p>}
      {error && <p className="validation-msg error">{error}</p>}

      {!loading && users.length === 0 && <div className="card text-center"><p>No users found.</p></div>}

      {!loading && users.length > 0 && (
        <div className="table-container">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Requested Admin</th>
                <th>Super Admin</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'primary' : u.role === 'driver' ? 'success' : 'secondary'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.requestedAdmin ? "Yes" : "No"}</td>
                  <td>{u.superAdmin ? "Yes" : "No"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleEdit(u.id, u.role)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>

                    {u.role === "pending-admin" && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ padding: '4px 8px', fontSize: '12px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                        onClick={() => handleApprove(u.id)}
                      >
                        Approve
                      </button>
                    )}

                    {u.role === "admin" && !u.superAdmin && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleRevoke(u.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
